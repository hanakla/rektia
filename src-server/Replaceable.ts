interface State {}

export default class Replaceable<T extends {} = State> {
    /** Serialize current state */
    public static __detach(): any {
        return {}
    }

    /** Restore state from before state */
    public static __attach(beforeState: any) { };
}
