"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Future extends Promise {
    constructor(executor) {
        super(() => { });
        this._resolved = false;
        this._promise = new Promise((resolve, reject) => {
            const _resolve = (value) => {
                this._resolved = true;
                this._value = value;
                resolve(true);
            };
            const _reject = (error) => {
                this._resolved = true;
                this._error = error;
                resolve(false);
            };
            executor(_resolve, _reject);
        });
    }
    static defer() {
        let _value;
        let _error;
        let resolver;
        let rejecter;
        const future = {
            resolve: (value) => {
                if (_value || _error)
                    return;
                _value = value;
                const resolverRunner = () => {
                    if (resolver) {
                        resolver(_value);
                        _value = null;
                    }
                    else {
                        process.nextTick(resolverRunner);
                    }
                };
                resolverRunner();
            },
            reject: (error) => {
                if (_value || _error)
                    return;
                _error = error;
                const rejecterRunner = () => {
                    if (rejecter) {
                        rejecter(_error);
                        _error = null;
                    }
                    else {
                        process.nextTick(rejecterRunner);
                    }
                };
            }
        };
        future.future = new Future((resolve, reject) => {
            resolver = resolve;
            rejecter = reject;
        });
        return future;
    }
    then(onFulfilled, onRejected) {
        this._promise.then(onFulfilled, onRejected);
        return this;
    }
    catch(onRejected) {
        this._promise.catch(onRejected);
        return this;
    }
    get result() {
        if (!this._resolved) {
            throw new Error('Future is not coming yet.');
        }
        if (this._error) {
            throw new Error('result() is called on failed Future');
        }
        return this._value;
    }
    get error() {
        if (!this._resolved) {
            throw new Error('Future is not coming yet.');
        }
        if (this._value) {
            throw new Error('result() is called on success Future');
        }
        return this._error;
    }
}
exports.default = Future;
