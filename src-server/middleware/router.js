import Router from "../router"

export default function router(swapper, options) {
    var router = new Router(swapper, options);
    router.load(options.routes);

    return (req, res, next) => {
        try {
            router.handle(req, res, next);
        }
        catch (e) {
            next(e);
        }
    };
}
