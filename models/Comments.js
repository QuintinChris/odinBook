var mongoose = require('mongoose');

const Schema = mongoose.Schema;

let requiredString = {
    type: String,
    required: true
};
let requiredUser = {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
};

const CommentSchema = new Schema({
    content: requiredString,
    timestamp: {
        type: Date,
        default: Date.now()
    },
    user: requiredUser,
    likes: {
        type: Number,
        default: 0
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
});

module.exports = mongoose.model("Comment", CommentSchema);