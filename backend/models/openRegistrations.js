const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const openRegistration = new Schema({
    dept: {
        type: String,
        required: true,
    },
    sem: {
        type: Number,
        required: true,
    },
    numElectives: {
        type: Number,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("openRegistration", openRegistration);