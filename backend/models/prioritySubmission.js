const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const prioritySubmissionSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    priorities: {
        type: [String],
        required: true
    },
    courses: {
        type: [String],
        required: true
    },
    dept: {
        type: String,
        required: true
    },
    sem: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("prioritySubmission", prioritySubmissionSchema);