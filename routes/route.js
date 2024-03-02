const express = require("express");
const { homeView, gView, g2View, landingView, g2SaveData, nopermissionView, userDetailsView, appointmentView, adminUserList, appointmentSave, userTimeList, getAppointment, examinerView, driverList, userDetailsUpdate } = require("../controllers/mainController");
const isLoggedInOut = require("../middleware/isLoggedoutMiddleware.js");
const auth = require("../middleware/authMiddleware");
const checkUser = require("../middleware/checkUserTypeMiddleware");
const router = express.Router();
const examiner = require("../middleware/checkExaminer");
router.post("/api/saveData", g2SaveData);
router.post("/api/saveAppointmentData", appointmentSave);
router.post("/api/get-appointment", getAppointment);

// Route to the home page (dashboard)
router.get("/", homeView);

// Route to the home page (dashboard)
router.get("/home", homeView);

// Route to the g2 page
router.get("/g2", auth, g2View);

// Route to the g page
router.get("/g", auth, gView);

// Route to the examiner page
router.get("/examiner", auth, examiner, examinerView);
router.get("/get-user-detalis/:id", auth, examiner, userDetailsView);
router.post("/update/user/detalis/:id", userDetailsUpdate);
router.post("/examiner/get/user", driverList);

//route to landing page
router.get("/landing_page", isLoggedInOut, landingView);

// //route to no permission page
router.get("/nopermission", isLoggedInOut, nopermissionView);

router.get("/appointment", auth, checkUser, appointmentView);
router.get("/user/all", auth, checkUser, adminUserList);

router.post("/appointment/get/time", userTimeList);

module.exports = router;
