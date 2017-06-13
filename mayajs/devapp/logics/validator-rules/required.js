module.exports = {
    name : "required",
    validate(val, ctx) {
        return (val == null || val.length === 0) ? `Field ${ctx.label} must be required.` : null;
    }
}
