const test = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./helpers.cjs');

for (const pathname of ['/projects', '/projects/123', '/calendar/123', '/notepad/123']) {
  test(`first push setup uses the root worker from ${pathname}`, async () => {
    let registered;
    const h = harness({ globals: {
      navigator: { serviceWorker: {
        getRegistration: async () => undefined,
        register: async url => { registered = new URL(url, 'https://fixture.invalid' + pathname); },
        ready: Promise.resolve({ pushManager: { getSubscription: async () => ({}) } })
      } },
      window: { PushManager: function() {} },
      ServiceWorkerRegistration: { prototype: { showNotification() {} } },
      Notification: { permission: 'granted' }
    } });
    assert.equal(await h.load('utils/notification/notification_client.ts').setupNotifications(), true);
    assert.equal(registered.pathname, '/service_worker.js');
  });
}
