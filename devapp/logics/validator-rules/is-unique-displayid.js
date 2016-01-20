/**
 * @param {Any} value
 * @return {String} if value has error returns error message
 */
module.exports = {
    name : "isUniqueDisplayId",
    validate : function* (value, ctx) {
        // console.log(value, maya.models.User);
        const matches = yield maya.models.User.find({displayId: value}).limit(1);
        return matches.length ?  `${ctx.label} ${value} already used.` : undefined;
    }
};
