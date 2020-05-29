var mongoose = require('mongoose');

const Schema = mongoose.Schema;

let requiredUser = {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
};

const FriendSchema = new Schema({
    user1: requiredUser,
    user2: requiredUser,
    status: {
        type: String,
        default: 'Pending'
    }
});

module.exports = mongoose.model("Friend", FriendSchema);