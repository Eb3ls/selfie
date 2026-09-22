const test = require('node:test');
const assert = require('node:assert/strict');
const { harness, ids, id, request } = require('./helpers.cjs');
const calendarPath = 'app/api/(auth)/calendar/getCalendar/[id]/route.ts';
const linkPath = 'app/api/(auth)/project/activity/link/route.ts';
const calendar = (h, target) => h.load(calendarPath).GET(request('/api/calendar/getCalendar/' + target), { params: Promise.resolve({ id: String(target) }) });
const link = (h, prevIds = [], nextId = String(ids.after)) => h.load(linkPath).PATCH(request('/api/project/activity/link', { prevIds, nextId }));
const strings = values => Array.from(values, String);

test('resource endpoint rejects an ordinary user calendar before reading events', async () => {
  const h = harness();
  assert.equal((await calendar(h, ids.owner)).status, 403);
  assert.equal(h.operations.some(op => op.name === 'events'), false);
});

test('resource calendars retain shared booking details and participant names', async () => {
  const h = harness();
  const response = await calendar(h, ids.resource);
  assert.equal(response.status, 200);
  const { events } = await response.json();
  assert.equal(events.length, 1);
  assert.equal(events[0].summary, 'Room booking');
  assert.deepEqual(events[0].usernameList, ['owner', '[RES]-Room']);
  assert.equal(events[0].userIdList, undefined);
});

test('an empty resource calendar returns an empty list', async () => {
  const h = harness(); h.rows.events = [];
  const response = await calendar(h, ids.resource);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { events: [] });
});

for (const [label, target, status] of [['invalid', 'invalid', 400], ['missing', id(99), 404]]) {
  test(`${label} resource ID is rejected`, async () => {
    const h = harness();
    assert.equal((await calendar(h, target)).status, status);
    assert.equal(h.operations.some(op => op.name === 'events'), false);
  });
}

test('requests without a session are rejected before database access', async () => {
  const h = harness({ user: null });
  assert.equal((await calendar(h, ids.resource)).status, 400);
  assert.equal((await link(h)).status, 400);
  assert.equal(h.operations.length, 0);
});

test('a project member cannot clear an owner activity dependency list', async () => {
  const h = harness();
  assert.equal((await link(h)).status, 400);
  assert.equal(h.writes().length, 0);
  assert.deepEqual(strings(h.rows.projectActivities[1].prevIdList), [String(ids.before)]);
  assert.equal(h.rows.projectActivities[1].status, 'WAITING');
});

test('owning a predecessor does not authorize editing someone else\'s target', async () => {
  const h = harness(); h.rows.projectActivities[0].ownerId = ids.member;
  assert.equal((await link(h, [String(ids.before)])).status, 400);
  assert.equal(h.writes().length, 0);
});

for (const [label, prev, next] of [
  ['invalid target', [], 'invalid'], ['invalid predecessor', ['invalid'], String(ids.after)],
  ['non-string predecessor', [2], String(ids.after)], ['non-array predecessors', {}, String(ids.after)]
]) {
  test(`link rejects ${label} before database access`, async () => {
    const h = harness({ user: ids.owner });
    assert.equal((await link(h, prev, next)).status, 400);
    assert.equal(h.operations.length, 0);
  });
}

test('missing predecessors do not silently clear existing links', async () => {
  const h = harness({ user: ids.owner });
  assert.equal((await link(h, [String(id(99))])).status, 404);
  assert.equal(h.writes().length, 0);
});

test('predecessors from another project are rejected without writes', async () => {
  const h = harness({ user: ids.owner }); h.rows.projectActivities[2].projectId = id(98);
  assert.equal((await link(h, [String(ids.replacement)])).status, 404);
  assert.equal(h.writes().length, 0);
});

test('owner can clear dependencies on both sides and activate the target', async () => {
  const h = harness({ user: ids.owner });
  assert.equal((await link(h)).status, 200);
  assert.equal(h.rows.projectActivities[0].nextIdList.length, 0);
  assert.equal(h.rows.projectActivities[1].prevIdList.length, 0);
  assert.equal(h.rows.projectActivities[1].status, 'ACTIVABLE');
});

for (const [predecessorStatus, targetStatus] of [['WAITING', 'WAITING'], ['COMPLETED', 'ACTIVABLE']]) {
  test(`owner can replace dependencies with a ${predecessorStatus} predecessor`, async () => {
    const h = harness({ user: ids.owner }); h.rows.projectActivities[2].status = predecessorStatus;
    assert.equal((await link(h, [String(ids.replacement)])).status, 200);
    assert.equal(h.rows.projectActivities[0].nextIdList.length, 0);
    assert.deepEqual(strings(h.rows.projectActivities[2].nextIdList), [String(ids.after)]);
    assert.deepEqual(strings(h.rows.projectActivities[1].prevIdList), [String(ids.replacement)]);
    assert.equal(h.rows.projectActivities[1].status, targetStatus);
  });
}

test('old dependencies belonging to another owner cannot be rewritten', async () => {
  const h = harness({ user: ids.owner }); h.rows.projectActivities[0].ownerId = ids.member;
  assert.equal((await link(h)).status, 400);
  assert.equal(h.writes().length, 0);
});

test('cleanup does not modify links in another project', async () => {
  const h = harness({ user: ids.owner });
  h.rows.projectActivities.push({ ...h.rows.projectActivities[0], _id: id(91), projectId: id(92) });
  assert.equal((await link(h)).status, 200);
  assert.deepEqual(strings(h.rows.projectActivities[3].nextIdList), [String(ids.after)]);
});

test('predecessors later than the target are rejected without writes', async () => {
  const h = harness({ user: ids.owner }); h.rows.projectActivities[2].due = '2026-02-01T00:00:00.000Z';
  assert.equal((await link(h, [String(ids.replacement)])).status, 400);
  assert.equal(h.writes().length, 0);
});

test('uppercase target IDs still clear both sides of existing links', async () => {
  const h = harness({ user: ids.owner });
  assert.equal((await link(h, [], String(ids.after).toUpperCase())).status, 200);
  assert.equal(h.rows.projectActivities[0].nextIdList.length, 0);
  assert.equal(h.rows.projectActivities[1].prevIdList.length, 0);
});

test('uppercase predecessor IDs are accepted as the same existing activity', async () => {
  const h = harness({ user: ids.owner });
  assert.equal((await link(h, [String(ids.before).toUpperCase()])).status, 200);
  assert.deepEqual(strings(h.rows.projectActivities[1].prevIdList), [String(ids.before)]);
});

test('mixed-case IDs cannot create a dependency on the target itself', async () => {
  const h = harness({ user: ids.owner });
  assert.equal((await link(h, [String(ids.after)], String(ids.after).toUpperCase())).status, 400);
  assert.equal(h.writes().length, 0);
});
