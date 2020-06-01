const express = require("express");
const router = express.Router({ mergeParams: true }); // https://cedric.tech/blog/expressjs-accessing-req-params-from-child-routers/
const commentController = require("../controllers/commentController");

// POST to create comment
router.post("/new", commentController.commentCreate);

// PUT to edit comment
router.put("/:commentid/edit", commentController.commentEdit);

// POST to like comment
router.post("/:commentid/like", commentController.commentLike);

module.exports = router;