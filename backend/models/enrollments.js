const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const enrollmentSchema = new Schema( {
    courseCode: {
        type: String
    },
    dept: {
        type: String
    },
    sem: {
        type: Number
    },
    students: {
        type: [String]
    },
    seats: {
        type: Number
    }
});

module.exports = mongoose.model("enrollment", enrollmentSchema);