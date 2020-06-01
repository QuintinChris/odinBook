var Post = require('../models/Posts');
var validator = require('express-validator');

// create post
exports.postCreate = [
    validator.body("content").trim(),
    validator.sanitizeBody("*").escape(),
    (req, res, next) => {
        const post = new Post({
            content: req.body.content,
            user: req.user,
        }).save((err) => {
            if (err) {
                return next(err);
            }
            return res.redirect("/");
        });
    },
];

// edit post
exports.postEdit = [
    validator.body("content").trim(),
    validator.sanitizeBody("*").escape(),
    (req, res, next) => {
        Post.findByIdAndUpdate(
            req.params.id,
            { content: req.body.content },
            (err, doc) => {
                if (err) {
                    return next(err);
                }
                if (!doc) {
                    return res.sendStatus(404);
                }
                return res.sendStatus(200);
            }
        );
    },
];

// like post
exports.postLike = (req, res, next) => {
    Post.findByIdAndUpdate(
        req.params.id,
        {
            $inc: { likes: 1 },
        },
        (err, doc) => {
            if (err) {
                return next(err);
            }
            if (!doc) {
                return res.sendStatus(404);
            }
            return res.redirect(req.get("referer"));
        }
    );
};

// delete post
exports.postDelete = (req, res, next) => {
    Post.findByIdAndRemove(req.params.id, (err, doc) => {
        if (err) {
            return next(err);
        }
        if (!doc) {
            return res.sendStatus(404);
        }
        return res.sendStatus(204);
    });
};