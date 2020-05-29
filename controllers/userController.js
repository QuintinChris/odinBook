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

