import extend from "./utils/extend";
import Controller from "./controller";

export default class RestController extends Controller {
    /**
     * @static
     * @method create
     * @param {Object} proto
     * @return {RestController}
     */
    static create(proto) {
        var SubClass = extend(proto, RestController);
        return new SubClass();
    }

    get_index(req, res) {
        console.log(req.body, req.params, res.query);
    }

    post_index(req, res) {

    }

    delete_index(req, res) {

    }

    put_index(req, res) {

    }

    patch_index(req, res) {

    }

    _dispose() {
        if (this.disposed) {
            return;
        }
    }
};
