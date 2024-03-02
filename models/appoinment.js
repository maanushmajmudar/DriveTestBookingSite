const mongoose = require("mongoose");

const Appointment = mongoose.model(
    "Appointment",
    new mongoose.Schema({
        date: {
            type: String,
        },
        time: {
            type: String,
        },
        isTimeSlotAvailable: {
            type: Boolean,
            default: false,
        },
    })
);
module.exports = Appointment;
