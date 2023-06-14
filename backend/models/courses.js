const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    courseCode: {
        tye: String,
    },
    courseName: {
        type: String,
    },
    courseType: {
        type: String,
    },
    courseCredits: {
        type: Number,
    },
    courseOverview: {
        type: String,
    },
    coursePreRequisites: {
        type: [String],
    },
    courseOutcomes: {
        type: [String],
    },
    seats: {
        type: Number,
    }
});

module.exports = mongoose.model("course", courseSchema);