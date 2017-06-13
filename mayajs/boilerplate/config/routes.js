module.exports = {
    // Router format: "[httpMethod ]/assign/route/:param" : "controller.method"
    // `:paramName` is captured into `req.params.<paramName>` on routed controller.
    //
    // Example :
    //  "/user/:userId/profile" : "user.profile"
    //  "post /user/:userId/update_profile" : "user.update_profile"
};
