module.exports = {
    validate() {

    },

    // Logic methods first arguments passing target Model
    /**
     * @param {maya.models.User} model
     */
    getDisplayId(model) {
        return model.displayId;
    }
};
