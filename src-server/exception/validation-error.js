import extend from "../utils/extend"

export default function ValidationError(fails) {
    Error.apply(this, arguments);

    this.message = "Validation failed";
    this.fails = fails;
    Error.captureStackTrace(this, this.constructor);
}

extend(ValidationError, Error);
