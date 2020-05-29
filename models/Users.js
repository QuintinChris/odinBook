var mongoose = require('mongoose');

const Schema = mongoose.Schema;

let requiredString = {
    type: String,
    required: true
};

const UserSchema = new Schema({
    id: requiredString,
    name: requiredString,
    photoUrl: { type: String }
});

module.exports = mongoose.model("User", UserSchema);