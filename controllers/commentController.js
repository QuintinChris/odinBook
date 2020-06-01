var Comment = require('../models/Comments');
var validator = require('express-validator');

// create comment
exports.commentCreate = [
    validator.body("content").trim(),
    validator.sanitizeBody("*").escape(),
    (req, res, next) => {
        const comment = new Comment({
            content: req.body.content,
            user: req.user,
            post: req.params.id,
        }).save((err) => {
            if (err) {
                return next(err);
            }
            return res.redirect(req.get("referer"));
        });
    },
];

// edit comment
exports.commentEdit = [
    validator.body("content").trim(),
    validator.sanitizeBody("*").escape(),
    (req, res, next) => {
        Comment.findByIdAndUpdate(
            req.params.commentid,
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

// like comment
exports.commentLike = (req, res, next) => {
    Comment.findByIdAndUpdate(
        req.params.commentid,
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