module.exports = function checkUser(req, res, next) {
    if (req.session.userType == "Admin") {
        next();
    } else {
        // return Permission
        res.render("nopermission");
    }
};
