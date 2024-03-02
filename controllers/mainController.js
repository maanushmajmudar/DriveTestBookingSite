const db = require("../models");
const User = db.user;
const Appoinment = db.appoinment;
const session = require("express-session");
const ObjectID = require("mongodb").ObjectId;
var crypto = require("crypto");
const { type } = require("os");
var cypherKey = "maanush";

// For Register Page
const homeView = (req, res) => {
    const user = { checkUser: req.session.userType };
    res.render("index", { user });
};

const nopermissionView = (req, res) => {
    res.render("nopermission", {});
};

const examinerView = (req, res) => {
    User.find({ appointment_id: { $exists: true, $ne: null }, UserType: "Driver" }, (err, user) => {
        user.checkUser = req.session.userType;
        res.render("examiner", { user });
    });
};

const examinerdetailView = (req, res) => {
    User.find({ appointment_id: { $exists: true, $ne: null }, UserType: "Driver" }, (err, user) => {
        user.checkUser = req.session.userType;
        res.render("examinerdetail", { user });
    });
};

const g2View = (req, res) => {
    if (req.session.userType !== "Driver") {
        res.render("nopermission");
    } else {
        User.findOne({ UserEmail: req.session.username }, (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (user.firstname === "default" && user.lastname === "default" && user.License_No === "default" && user.Age === 0 && user.car_details.make === "default" && user.car_details.model === "default" && user.car_details.year === 0 && user.car_details.plateno === "default") {
                var g2Data = {
                    firstname: "",
                    lastname: "",
                    License_No: "",
                    Age: undefined,
                    car_make: "",
                    car_model: "",
                    car_year: "",
                    car_plateno: "",
                };
            } else {
                var decipher = crypto.createDecipher("aes-256-cbc", cypherKey);
                var decryptedLicenseNo = decipher.update(user.License_No, "hex", "utf8");
                decryptedLicenseNo += decipher.final("utf8");

                var g2Data = {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    License_No: decryptedLicenseNo,
                    Age: user.Age,
                    car_make: user.car_details.make,
                    car_model: user.car_details.model,
                    car_year: user.car_details.year,
                    car_plateno: user.car_details.plateno,
                };
            }
            let date_time = new Date();

            let date = ("0" + date_time.getDate()).slice(-2);
            let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
            let year = date_time.getFullYear();
            let currentDate = year + "-" + month + "-" + date;

            Appoinment.find(
                {
                    date: currentDate,
                    isTimeSlotAvailable: false,
                },
                {
                    _id: 1,
                    time: 1,
                },
                (err, result) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    dataList = [];
                    dataList1 = [];
                    if (result) {
                        for (var i = 0; i < result.length; i++) {
                            dataList.push(result[i].time);
                            // dataList.push(result[i]._id);
                        }
                        for (var i = 0; i < result.length; i++) {
                            dataList1.push(result[i]._id);
                        }
                    }
                    const userData = {
                        checkUser: req.session.userType,
                        g2Data: g2Data,
                        timeSlote: dataList,
                        timeIds: dataList1,
                    };
                    res.render("g2", { user: userData });
                }
            );
        });
    }
};

const gView = (req, res) => {
    if (req.session.userType !== "Driver") {
        res.render("nopermission");
    } else {
        User.findOne({ UserEmail: req.session.username }, (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            user.checkUser = req.session.userType;
            if (user.License_No != "default") {
                var decipher = crypto.createDecipher("aes-256-cbc", cypherKey);
                var decryptedLicenseNo = decipher.update(user.License_No, "hex", "utf8");
                decryptedLicenseNo += decipher.final("utf8");
                user.License_No = decryptedLicenseNo;
            }
            Appoinment.find(
                {
                    _id: user.appointment_id,
                },

                (err, appoinment) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    user.appoinment = appoinment;
                }
            );

            res.render("g", { user });
        });
    }
};

const landingView = (req, res) => {
    const user = null; // Set the initial value of user to null
    res.render("landing_page", { user });
};

const appointmentView = (req, res) => {
    const user = { checkUser: req.session.userType };

    res.render("appoinment", { user });
};

const g2SaveData = (req, res) => {
    var cipher = crypto.createCipher("aes-256-cbc", cypherKey);
    var encryptedLicenseNo = cipher.update(req.body.License_No, "utf8", "hex");
    var testType = "";
    encryptedLicenseNo += cipher.final("hex");
    if (req.body.slote) {
        testType = "G2";
    }
    User.updateOne(
        { UserEmail: req.session.username },
        {
            $set: {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                License_No: encryptedLicenseNo,
                Age: req.body.age,
                "car_details.make": req.body.car_make,
                "car_details.model": req.body.car_model,
                "car_details.year": req.body.car_year,
                "car_details.plateno": req.body.car_plateno,
                appointment_id: req.body.slote,
                TestType: testType,
            },
        },
        (err, result) => {
            if (err) res.status(500).send({ message: err });
        }
    );
    Appoinment.updateOne(
        { _id: req.body.slote },
        {
            $set: {
                isTimeSlotAvailable: true,
            },
        },
        (err, result) => {
            if (err) res.status(500).send({ message: err });
        }
    );
    res.redirect("/g");
};

const appointmentSave = async (req, res) => {
    var timeList = req.body.time.split(",");

    timeList.forEach((time) => {
        const appoinment = new Appoinment({
            date: req.body.date,
            time: time,
        });
        var data = {};
        Appoinment.findOne(
            {
                date: req.body.date,
                time: time,
            },
            (err, result) => {
                if (!result) {
                    appoinment.save((err) => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                    });
                }
            }
        );
    });
    return res.status(200).send({ message: "Saved" });
};

const getAppointment = (req, res) => {
    var data = {};
    if (req.body.isTimeSlotAvailable === "yes") {
        data = {
            date: req.body.date,
            isTimeSlotAvailable: false,
        };
    } else {
        data = {
            date: req.body.date,
        };
    }
    Appoinment.find(
        data,

        (err, appoinment) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            res.send({ appoinment });
        }
    );
};

const driverList = (req, res) => {
    dateArray = [];
    User.find({ appointment_id: { $exists: true, $ne: null }, UserType: "Driver" }, (err, user) => {
        for (let i = 0; i < user.length; i++) {
            Appoinment.findById(
                user[i].appointment_id,

                (err, appoinment) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    console.log(appoinment.time);
                    dateArray.push(appoinment.time);
                }
            );
            // console.log(temp);
        }
        res.send({ user, dateArray });
    });
};

const userTimeList = (req, res) => {
    Appoinment.findById(
        req.body.id,

        (err, appoinment) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            res.send({ appoinment });
        }
    );
};

const adminUserList = (req, res) => {
    User.find({ appointment_id: { $exists: true, $ne: null }, UserType: "Driver" }, (err, user) => {
        user.checkUser = req.session.userType;

        res.render("userAll", { user });
    });
};
const userDetailsView = (req, res) => {
    User.findOne({ _id: req.params.id, UserType: "Driver" }, (err, user) => {
        user.checkUser = req.session.userType;
        res.render("examinerdetail", { user });
    });
};

const userDetailsUpdate = async (req, res) => {
    await User.findByIdAndUpdate(
        { _id: req.params.id },
        {
            Comment: req.body.comment,
            Result: req.body.result,
        }
    );
    res.redirect("/examiner");
};
module.exports = {
    homeView,
    userDetailsUpdate,
    userDetailsView,
    g2View,
    gView,
    landingView,
    g2SaveData,
    nopermissionView,
    appointmentView,
    appointmentSave,
    getAppointment,
    examinerView,
    driverList,
    userTimeList,
    adminUserList,
};
