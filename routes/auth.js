const express = require("express");
const { loginView, signin, signup, signUpView, signupSuccess, logout } = require("../controllers/authControllers.js");
const isLoggedInOut = require("../middleware/isLoggedoutMiddleware.js");
const router = express.Router();

// For POST-Support
let bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/login", isLoggedInOut, loginView);
router.get("/signup", isLoggedInOut, signUpView);
router.get("/signup_success", isLoggedInOut, signupSuccess);
router.get("/logout", logout);

router.post("/api/signin", signin);
router.post("/api/signup", signup);

// router.post("/api/signup",
//     signup
// );

module.exports = router;
