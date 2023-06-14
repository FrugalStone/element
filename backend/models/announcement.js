const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
    announcement: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("announcement", announcementSchema);