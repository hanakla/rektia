// Attach req to view via res.locals
export default function attachParams() {
    return function* (next) {
        this.maya = global.maya;
        yield next;
    };
}
