// Attach req to view via res.locals
export default function attachParams(app) {
    return (req, res, next) => {
        req.maya = app;
        res.locals.req = req;
        next();
    };
}
