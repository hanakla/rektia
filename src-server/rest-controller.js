import _ from "lodash";
import Controller from "./controller";

export default class RestController extends Controller {
    /**
     * @static
     * @method create
     * @param {Object} proto
     * @param {String|Model} proto._model
     * @return {RestController}
     */
    static create(proto) {
        const protoInit = proto._init;
        delete proto._init;

        const restProto = Object.getPrototypeOf(RestController);
        const instance = Controller.create(_.extend({}, restProto, proto));

        // call proto._init
        if (protoInit) {
            proto._init = protoInit;
            protoInit.call(instance);
        }

        return instance;
    }

    _init() {
        // TODO: implement RestController
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
