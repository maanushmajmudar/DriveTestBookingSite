module.exports = function auth(req, res, next) {
    if (req.session.userid) {
        next();
    } else {
        // return unauthorized
        res.redirect("/auth/login");
    }
};
