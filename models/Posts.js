var mongoose = require('mongoose');

const Schema = mongoose.Schema;

let requiredString = {
    type: String,
    required: true
};

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: requiredString,
    timestamp: {
        type: Date,
        default: Date.now()
    },
    likes: {
        type: Number,
        default: 0
    }

});

module.exports = mongoose.model("Post", PostSchema);