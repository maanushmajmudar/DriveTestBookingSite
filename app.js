// connection string - mongodb+srv://maanush98:Maanush%401998@assignments.bxmywff.mongodb.net/?retryWrites=true&w=majority
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

app.use(session({ secret: "maanush", resave: true, saveUninitialized: true }));

var crypto = require("crypto");
var cypherKey = "maanush";

// Set the view engine to ejs
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static("public"));

const db = require("./models");
const User = db.user; // Assuming User model is imported from "./models"
const Appoinment = db.appoinment;

// Connect to MongoDB
mongoose
    .connect("mongodb+srv://maanush98:Maanush%401998@assignments.bxmywff.mongodb.net/?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

// Middleware to parse the request body
app.use(express.urlencoded({ extended: true }));

// Page routing
app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes/route"));

// Save data to the database
app.post("/save", async (req, res) => {
    // Added async keyword
    const { firstname, lastname, License_No, Age, car_make, car_model, car_year, car_plateno } = req.body;

    try {
        var cipher = crypto.createCipher("aes-256-cbc", cypherKey);
        var encryptedLicenseNo = cipher.update(License_No, "utf8", "hex");
        encryptedLicenseNo += cipher.final("hex");

        const newUser = new User({
            firstname,
            lastname,
            License_No: encryptedLicenseNo, // Store encrypted License Number
            Age,
            car_details: {
                make: car_make,
                model: car_model,
                year: car_year,
                plateno: car_plateno,
            },
        });

        await newUser.save();
        console.log("User G2 data added successfully");
        res.render("g2_success");
    } catch (error) {
        console.error("Error adding G2 data:", error);
        res.redirect("/error");
    }
});

// Fetch user data based on license number
// app.post("/fetch-user", async (req, res) => {
//   // Added async keyword
//   const { licenseNumber } = req.body;
//   var cipher = crypto.createCipher("aes-256-cbc", cypherKey);
//   var encryptedLicenseNo = cipher.update(licenseNumber, "utf8", "hex");
//   encryptedLicenseNo += cipher.final("hex");

//   try {
//     const user = await User.findOne({ License_No: encryptedLicenseNo });
//     var decipher = crypto.createDecipher("aes-256-cbc", cypherKey);
//     user.License_No = decipher.update(user.License_No, "hex", "utf8");
//     user.License_No += decipher.final("utf8");
//     if (!user) {
//       res.render("no_user_found");
//     } else {
//       res.render("g", { user });
//     }
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     res.redirect("/error");
//   }
// });

// Update user data
app.post("/update-user/:id", async (req, res) => {
    // Added async keyword
    const userId = req.params.id;
    var testType = "";
    const { car_make, car_model, car_year, car_plateno } = req.body;
    if (req.body.slote) {
        testType = "G";
    }

    try {
        await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "car_details.make": car_make,
                    "car_details.model": car_model,
                    "car_details.year": car_year,
                    "car_details.plateno": car_plateno,
                    appointment_id: req.body.slote,
                    TestType: testType,
                },
            },
            { new: true }
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
                console.log(result);
            }
        );
        console.log("User updated successfully");
        res.render("g_success");
    } catch (error) {
        console.error("Error updating user:", error);
        res.redirect("/error");
    }
});

// Start the server
app.listen(4000, () => {
    console.log("Server started on port 4000");
});
