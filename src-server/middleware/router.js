export default function router(router) {
    return (req, res, next) => {
        try {
            router.handle(req, res, next);
        }
        catch (e) {
            next(e);
        }
    };
}
