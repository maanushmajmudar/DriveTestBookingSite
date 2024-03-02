const db = require("../models");
const session = require("express-session");
const express = require("express");
const bcrypt = require("bcryptjs");

const app = express();

app.use(session({ secret: "maanush", resave: true, saveUninitialized: true }));
const User = db.user;

// For Register Page
const loginView = (req, res) => {
    const user = null;
    res.render("login", { user });
};

const signupSuccess = (req, res) => {
    const user = null;
    res.render("signup_success", { user });
};

const signUpView = (req, res) => {
    const user = req.session.error;
    res.render("signup", { user });
};

const nopermissionView = (req, res) => {
    const user = null;
    res.render("nopermission", { user });
};

const signin = (req, res) => {
    User.findOne(
        {
            UserEmail: req.body.UserEmail,
        },
        (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (!user) {
                console.log(!user);
                return res.redirect("/auth/signup");
            }

            const passwordIsValid = bcrypt.compareSync(req.body.password, user.Password);

            if (!passwordIsValid) {
                return res.status(401).send({ message: "Invalid Password!" });
            }

            req.session.userid = user._id;
            req.session.username = user.UserEmail;
            req.session.userType = user.UserType;
            req.session.firstname = user.firstname;

            if (user.UserType === "Admin") {
                console.log(req.session.userType);
                res.redirect("/appointment");
            } else if (user.UserType === "Examiner") {
                res.redirect("/examiner");
            } else if (user.firstname === "default" && user.lastname === "default" && user.License_No === "default" && user.Age === 0 && user.car_details.make === "default" && user.car_details.model === "default" && user.car_details.year === 0 && user.car_details.plateno === "default") {
                res.redirect("/g2");
            } else {
                res.redirect("/g");
            }
        }
    );
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect("/auth/login");
};

const signup = (req, res) => {
    const { username, password, confirmpassword, userType } = req.body;

    // Validate input fields
    if (!username || !password || !confirmpassword || !userType) {
        const error = "All fields are required!";
        return res.render("signup", { user: { error, username } });
    }

    if (password !== confirmpassword) {
        const error = "Passwords do not match!";
        return res.render("signup", { user: { error, username } });
    }

    // Check if username already exists
    User.findOne({ UserEmail: username }, (err, existingUser) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (existingUser) {
            const error = "Username already exists!";
            return res.render("signup", { user: { error, username } });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = new User({
            UserEmail: username,
            UserType: userType,
            Password: hashedPassword,
            firstname: "default",
            lastname: "default",
            License_No: "default",
            Age: 0,
            car_details: {
                make: "default",
                model: "default",
                year: 0,
                plateno: "default",
            },
        });

        user.save((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            res.redirect("/auth/signup_success");
        });
    });
};

module.exports = {
    loginView,
    signin,
    signup,
    signUpView,
    signupSuccess,
    nopermissionView,
    logout,
};
