var Friend = require('../models/Friends');

// send friend request (create friendship, default status of pending)
exports.friendshipCreate = (req, res, next) => {
    const friendship = new Friendship({
        user1: req.user._id,
        user2: req.params.id,
    }).save((err) => {
        if (err) {
            return next(err);
        }
    });
    return res.redirect("/");
};

// accept friend request (change status to accepted)
exports.friendshipEdit = (req, res, next) => {
    Friend.findByIdAndUpdate(
        req.params.id,
        { status: "Accepted" },
        (err, doc) => {
            if (err) {
                return next(err);
            }
            if (!doc) {
                return res.sendStatus(404);
            }
            return res.redirect("/");
        }
    );
};

// GET all friends of a specific user
exports.allFriendsForUser = (req, res, next) => {
    Friend.find({ user1: req.params.id }).exec((err, friends) => {
        if (err) {
            return next(err);
        }
        return res.json(friends);
    });
};