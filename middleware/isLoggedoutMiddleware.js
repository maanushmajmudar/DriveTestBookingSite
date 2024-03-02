module.exports = function isLoggedInOut(req, res, next) {
    // req.session.destroy();
    // req.session = null

    if (!req.session.userid) {
        // return res.status(401).send({ message: req.session.id });

        next();
    } else if (req.session.userType == "Admin") {
        res.redirect("/appointment");
    } else {
        // return unauthorized
        res.redirect("/g");
    }
};
