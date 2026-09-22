const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { ObjectId } = require('mongodb');
const { NextRequest } = require('next/server');

const root = path.resolve(__dirname, '..');
const id = n => new ObjectId(n.toString(16).padStart(24, '0'));
const ids = { member: id(1), owner: id(2), project: id(3), before: id(0xae), after: id(0xaf), resource: id(6), replacement: id(7) };

function fixtures() {
  const { member, owner, project, before, after, resource, replacement } = ids;
  const activity = (_id, overrides = {}) => ({
    _id, ownerId: owner, projectId: project, userIdList: [owner, member],
    prevIdList: [], nextIdList: [], status: 'WAITING',
    dtStart: '2026-01-01T00:00:00.000Z', due: '2026-01-02T00:00:00.000Z', ...overrides
  });
  return {
    users: [
      { _id: member, username: 'member', isResource: false },
      { _id: owner, username: 'owner', isResource: false },
      // Existing resource discovery uses the username prefix, including legacy records.
      { _id: resource, username: '[RES]-Room', isResource: false }
    ],
    events: [
      { _id: id(10), ownerId: owner, userIdList: [owner], summary: 'Private event', description: 'Private description', location: 'Private location' },
      { _id: id(11), ownerId: owner, userIdList: [owner, resource], summary: 'Room booking' }
    ],
    projectActivities: [
      activity(before, { nextIdList: [after] }),
      activity(after, { prevIdList: [before], dtStart: '2026-01-03T00:00:00.000Z', due: '2026-01-04T00:00:00.000Z' }),
      activity(replacement)
    ]
  };
}

// Execute the actual TS handlers, validation, models, and database wrappers.
// Only external boundaries (Mongo transport, session identity, notifications) are replaced.
function harness({ user = ids.member, rows = fixtures(), globals = {} } = {}) {
  const operations = [];
  const equal = (a, b) => String(a) === String(b);
  function matches(row, filter) {
    return Object.entries(filter).every(([key, value]) => value && value.$in
      ? [row[key]].flat().some(item => value.$in.some(v => equal(item, v)))
      : equal(row[key], value));
  }
  const client = { db: () => ({ collection: name => ({
    find: filter => ({ toArray: async () => {
      operations.push({ kind: 'find', name, filter });
      return (rows[name] || []).filter(row => matches(row, filter));
    } }),
    updateMany: async (filter, update) => {
      const selected = (rows[name] || []).filter(row => matches(row, filter));
      selected.forEach(row => Object.assign(row, update.$set));
      operations.push({ kind: 'update', name, filter, update });
      return { modifiedCount: selected.length };
    }
  }) }) };
  const cache = new Map();
  function load(relative) {
    let file = path.resolve(root, relative);
    if (!path.extname(file)) file += '.ts';
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} }; cache.set(file, mod);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true
    } }).outputText;
    function localRequire(name) {
      if (name === '@/utils/db/db_client') return { clientPromise: Promise.resolve(client) };
      if (name === '@/utils/session/session') return { getSession: async () => user === null ? null : { user: { _id: String(user), username: 'fixture' } } };
      if (name === '@/utils/notification/notification_server') return { sendNotification: async () => true };
      if (name.startsWith('@/')) return load(name.slice(2));
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
      return require(name);
    }
    const context = { console, process, Buffer, URL, Request, Response, TextEncoder, TextDecoder, setTimeout, clearTimeout, ...globals };
    vm.runInNewContext('(function(require,module,exports){' + source + '\n})', context, { filename: file })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return { load, rows, operations, writes: () => operations.filter(op => op.kind === 'update') };
}

const request = (pathname, body) => new NextRequest('https://fixture.invalid' + pathname, body === undefined ? {} : {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
});
module.exports = { harness, fixtures, ids, id, request };
