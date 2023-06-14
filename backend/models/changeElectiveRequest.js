const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const changeElectiveRequestSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    dept: {
        type: String,
        required: true
    },
    sem: {
        type: Number,
        required: true
    },
    status: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("changeElectiveRequest", changeElectiveRequestSchema);