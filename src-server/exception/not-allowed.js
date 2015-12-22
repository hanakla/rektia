import extend from "../utils/extend"

function NotAllowedException(message) {
    Error.apply(this, arguments);
    this.message = message;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor)
}

extend(NotAllowedException, Error);

export default NotAllowedException;
