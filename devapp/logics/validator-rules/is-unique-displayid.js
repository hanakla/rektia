const User = require("../models/user");

/**
 * @param {Any} value
 * @return {String} if value has error returns error message
 */
module.exports = function* (value) {
    const matches = yield maya.models.User.findWhere({displayId: valie}).limit(1);
    return matches.length ? "taked id already used." : undefined;
};
