var User = require('../models/Users');
var Post = require('../models/Posts');
var Friend = require('../models/Friends');
var Comment = require('../models/Comments');
var async = require('async');

// GET all users
exports.allUsers = (req, res, next) => {
    User.find({}).exec((err, userList) => {
        if (err) return next(err);
        res.render("user-list", { userList: userList, user: req.user });
    });
};

// GET profile (user details & posts)
exports.userProfile = (req, res, next) => {
    async.waterfall(
        [
            (callback) =>
                User.findById(req.params.id).exec((err, user) => {
                    if (err) return next(err);

                    callback(null, user);
                }),
            (user, callback) =>
                Post.find({ user: req.params.id }).populate('user').exec((err, userPosts) => {
                    if (err) return next(err);
                }),
            (user, userPosts, callback) =>
                Comment.find({ user: req.params.id }).exec((err, comments) => {
                    if (err) return next(err);

                    callback(null, user, userPosts, comments);
                }),
            (user, userPosts, comments, friends, callback) =>
                Friend.find({ user2: req.params.id }).exec(
                    (err, moreFriends) => {
                        if (err) return next(err);
                        friends = friends.concat(moreFriends);
                        callback(null, user, userPosts, comments, friends);
                    }
                ),
            (user, userPosts, comments, friends, callback) => {
                //let friends = [];
                function getFriends() {
                    return new Promise((resolve, reject) => {
                        if (friends.length <= 0) resolve();

                        for (let i = 0; i < friends.length; i++) {
                            if (friends[i].user1.equals(req.user._id)) {
                                User.findById(friends[i].user2).exec((err, user) => {
                                    if (err) return next(err);
                                    if (user === null) return res.sendStatus(404);

                                    userFriends.push(user);
                                    if (i === friends.length - 1) resolve();
                                });
                            } else {
                                User.findById(friends[i].user2).exec((err, user) => {
                                    if (err) return next(err);
                                    if (user === null) return res.sendStatus(404);

                                    userFriends.push(user);
                                    if (i === friends.length - 1) resolve();
                                });
                            }
                        }
                    });
                }

                getFriends().then(() =>
                    callback(null, user, userPosts, comments, friends, userFriends)
                );
            },

            (user, userPosts, comments, friends, userFriends, callback) => {
                User.findById(req.params.id).exec((err, user) => {
                    if (err) return next(err);
                    if (user === null) return sendStatus(404);
                    callback(null, { user, userPosts, comments, userFriends, user, friends });
                });
            }
        ],
        (err, results) => {
            if (err) return next(err);
            if (results.user === null) {
                let err = new Error('User not found');
                err.status = 404;
                return next(err);
            }
            // Friend request: only if user2 != user1 
            // && user2 hasn't already made request
            let friendRequestAvailable = req.user._id.toString() !== req.params.id.toString();
            results.friends.forEach((friend) => {
                if (friend.equals(result.user)) {
                    friendRequestAvailable = false;
                }
            });

            res.render('profile', {
                user: req.user,
                userProfile: results.user,
                posts: results.userPosts,
                comments: results.comments,
                friendRequestAvailable: friendRequestAvailable,
            });
        }
    );
};

// GET list of user friends
exports.userFriends = (req, res, next) => {
    let friends = [];
    async.waterfall([
        (callback) =>
            Friend.find({ user1: req.params.id }).exec((err, friends) => {
                if (err) return next(err);
                callback(null, friends);
            }),
        (friends, callback) =>
            Friend.find({ user2: req.params.id }).exec(
                (err, moreFriends) => {
                    if (err) return next(err);
                    friends = friends.concat(moreFriends);
                    callback(null, friends);
                }
            ),
        (friends, callback) => {
            function getFriends() {
                return new Promise((resolve, reject) => {
                    if (friends.length <= 0) resolve();
                    for (let i = 0; i < friends.length; i++) {
                        if (friends[i].user1.equals(req.params.id)) {
                            User.findById(friends[i].user2).exec((err, user) => {
                                if (err) return next(err);
                                if (user === null) return res.sendStatus(404);
                                if (friends[i].status == 'Accepted') {
                                    friends.push(user);
                                }
                                if (i === friends.length - 1) resolve();
                            });
                        } else {
                            User.findById(friends[i].user1).exec((err, user) => {
                                if (err) return next(err);
                                if (user === null) return res.sendStatus(404);
                                if (friends[i].status == 'Accepted') {
                                    friends.push(user);
                                }
                                if (i === friends.length - 1) resolve();
                            });
                        }
                    }
                });
            }
            getFriends().then(() => callback(null, friends, userFriends));
        },
        (friends, userFriends, callback) => {
            User.findById(req.params.id).exec((err, user) => {
                if (err) return next(err);
                if (user === null) return res.sendStatus(404);
                callback(null, { user, friends, userFriends });
            });
        }
    ],
        (err, results) => {
            if (err) return next(err);
            res.render('friendlist', {
                user: req.user,
                userProfile: results.user,
                friends: results.friends
            });
        });
};


// GET user friend requests
exports.userFriendRequests = (req, res, next) => {
    let friendRequests = [];
    async.waterfall([
        (callback) =>
            Friend.find({ user2: req.user._id }).exec((err, friends) => {
                if (err) return next(err);

                callback(null, friends);
            }),

        (friends, callback) => {
            function getFriends() {
                return new Promise((resolve, reject) => {
                    if (friends.length <= 0) resolve();
                    for (let i = 0; i < friends.length; i++) {
                        User.findById(friends[i].user1).exec((err, user) => {
                            if (err) return next(err);
                            if (user === null) return res.sendStatus(404);
                            if (friends[i].status == 'Pending') {
                                // Defining friend request object, pushing into array
                                friendRequests.push({
                                    user: user,
                                    status: 'Pending',
                                    id: friends[i].id
                                });
                            }
                            if (i === friends.length - 1) resolve();
                        });
                    }
                });
            }
            getFriends().then(() => callback(null, friendRequests));
        }
    ],
        (err, results) => {
            if (err) return next(err);
            res.render('friendRequests', {
                user: req.user,
                friendRequests: results
            });
        }
    );
};


// GET timeline - all posts by user + friends
exports.timeline = (req, res, next) => {
    let userFriends = [];
    async.waterfall(
        [
            (callback) =>
                User.findById(req.user._id).exec((err, user) => {
                    if (err) return next(err);
                    callback(null, user);
                }),
            (user, callback) =>
                Post.find({ user: req.user._id })
                    .populate('user')
                    .exec((err, userPosts) => {
                        if (err) return next(err);
                        callback(null, user, userPosts);
                    }),
            (user, userPosts, callback) =>
                Friend.find({ user1: req.user._id }).exec((err, friends) => {
                    if (err) return next(err);
                    if (friends === null) return next();
                    callback(null, user, userPosts, friends);
                }),
            (user, userPosts, friends, callback) => {
                Friend.find({ user2: req.user._id }).exec((err, moreFriends) => {
                    if (err) return next(err);
                    if (moreFriends === null) return next();
                    friends = friends.concat(moreFriends);
                    callback(null, user, userPosts, friends);
                }
                );
            },
            (user, userPosts, friends, callback) => {
                function getFriends() {
                    return new Promise((resolve, reject) => {
                        if (friends.length <= 0) resolve();

                        for (let i = 0; i < friends.length; i++) {
                            if (friends[i].user1.equals(req.user._id)) {
                                User.findById(friends[i].user2).exec((err, user) => {
                                    if (err) return next(err);
                                    if (user === null) return res.sendStatus(404);
                                    if (friends[i].status == "Accepted") {
                                        userFriends.push(user);
                                    }
                                    if (i === friends.length - 1) resolve();
                                });
                            } else {
                                User.findById(friends[i].user1).exec((err, user) => {
                                    if (err) return next(err);
                                    if (user === null) return res.sendStatus(404);
                                    if (friends[i].status == "Accepted") {
                                        userFriends.push(user);
                                    }
                                    if (i === friends.length - 1) resolve();
                                });
                            }
                        }
                    });
                }

                getFriends().then(() =>
                    callback(null, user, userPosts, friends, userFriends));
            },
            (user, userPosts, friends, userFriends, callback) => {
                let friendsPosts = [];
                function getFriendsPosts() {
                    return new Promise((resolve, reject) => {
                        if (userFriends.length <= 0) resolve();
                        for (let i = 0; i < userFriends.length; i++) {
                            Post.find({ user: userFriends[i].id }).exec((err, posts) => {
                                if (err) return next(err);
                                friendsPosts.push(...posts);
                                if (i === friends.length - 1) resolve();
                            });
                        }
                    });
                }
                getFriendsPosts.then(() =>
                    callback(null, user, userPosts, friends, userFriends, friendsPosts));
            },
            (user, userPosts, friends, userFriends, friendsPosts, callback) => {
                let posts = userPosts.concat(friendsPosts);
                Comment.find({}).exec((err, comments) => {
                    if (err) return next(err);
                    callback(null, { user, posts, comments });
                });
            },

        ],
        (err, results) => {
            if (err) return next(err);

            res.render('timeline', {
                posts: results.posts,
                user: results.user,
                comments: results.comments,
            });
        }
    );
};