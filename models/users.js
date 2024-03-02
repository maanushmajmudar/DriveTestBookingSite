const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        License_No: {
            type: String,
            required: true,
        },
        Age: {
            type: Number,
            required: true,
        },
        UserEmail: String,
        Password: String,
        UserType: String,
        car_details: {
            make: {
                type: String,
                required: true,
            },
            model: {
                type: String,
                required: true,
            },
            year: {
                type: Number,
                required: true,
            },
            plateno: {
                type: String,
                required: true,
            },
        },
        appointment_id: String,
        TestType: String,
        Comment: String,
        Result: String,
    })
);
module.exports = User;
