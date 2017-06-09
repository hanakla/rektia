interface Resolver<T> {
    (resolve: (value: T) => void, reject: (error: Error) => void): void
}

interface DeferredFuture<T> {
    future: Future<T>
    resolve: (value: T) => void
    reject: (error: Error) => void
}

export default class Future<T> extends Promise<boolean>
{
    public static defer<T>(): DeferredFuture<T>
    {
        let _value: T
        let _error: Error
        let resolver: (value: T) => void
        let rejecter: (error: Error) => void

        const future = ({
            resolve: (value: T) => {
                if (_value || _error) return;

                _value = value
                const resolverRunner = () => {
                    if (resolver) {
                        resolver(_value)
                        _value = null
                     } else {
                         process.nextTick(resolverRunner)
                     }
                }

                resolverRunner()
            },
            reject: (error: Error) => {
                if (_value || _error) return;

                _error = error
                const rejecterRunner = () => {
                    if (rejecter) {
                        rejecter(_error)
                        _error = null
                    } else {
                        process.nextTick(rejecterRunner)
                    }
                }
            }
        } as DeferredFuture<T>)

        future.future = new Future<T>((resolve, reject) => {
            resolver = resolve
            rejecter = reject
        })

        return future
    }

    private _promise: Promise<boolean>
    private _resolved: boolean = false
    private _value: T
    private _error: Error

    constructor(executor: Resolver<T>)
    {
        super(() => {})

        this._promise = new Promise<boolean>((resolve, reject) => {
            const _resolve = (value: T) => {
                this._resolved = true
                this._value = value
                resolve(true)
            }

            const _reject = (error: Error) => {
                this._resolved = true
                this._error = error
                resolve(false)
            }

            executor(_resolve, _reject)
        })
    }

    then(onFulfilled: (result: boolean) => void, onRejected: (error: Error) => void): this
    {
        this._promise.then(onFulfilled, onRejected)
        return this
    }

    catch(onRejected: (error: Error) => void): this
    {
        this._promise.catch(onRejected)
        return this
    }

    get result(): T
    {
        if (!this._resolved) {
            throw new Error('Future is not coming yet.')
        }

        if (this._error) {
            throw new Error('result() is called on failed Future')
        }

        return this._value
    }

    get error(): Error
    {
        if (!this._resolved) {
            throw new Error('Future is not coming yet.')
        }

        if (this._value) {
            throw new Error('result() is called on success Future')
        }

        return this._error
    }
}
