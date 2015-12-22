import extend from "../utils/extend"

function NotFoundException(message) {
    Error.apply(this, arguments);
    this.message = message;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor)
}

extend(NotFoundException, Error);

export default NotFoundException;
