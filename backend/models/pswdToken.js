const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pswdTokenSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("pswdToken", pswdTokenSchema)