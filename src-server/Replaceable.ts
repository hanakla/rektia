interface State {}

export default class Replaceable<T extends {} = State> {
    /** Serialize current state */
    public __detach(): T {
        return {} as T
    }

    /** Restore state from before state */
    public __attach<T>(beforeState: T) { };
}
