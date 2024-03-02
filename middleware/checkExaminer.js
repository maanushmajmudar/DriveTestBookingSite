module.exports = function checkUser(req, res, next) {
    if (req.session.userType == "Examiner") {
        next();
    } else {
        // return Permission
        res.render("nopermission");
    }
};
