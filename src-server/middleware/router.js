export default function router(router) {
    return function* (next) {
        try {
            yield router.handle(this);
            return yield next;
        }
        catch (e) {
            throw e;
        }
    };
}
