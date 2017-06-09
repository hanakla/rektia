export default class InMemorySessionStore {
    constructor() {
        this._store = {};
    }

    get(sid) {
        var sess = (this._store[sid] = this._store[sid] || {timeout: null, store : {}});

        if (sess.timeout !== null && sess.timeout <= Date.now()) {
            return sess.store = {};
        }

        return Promise.resolve(sess.store);
    }

    set(sid, store, ttlms) {
        const sess = (this._store[sid] = this._store[sid] || {timeout: null, store : {}});

        sess.timeout = new Date(Date.now() + ttlms);
        sess.store = store;

        return Promise.resolve();
    }

    destroy(sid) {
        delete this._store[sid];
        return Promise.resolve();
    }
}
