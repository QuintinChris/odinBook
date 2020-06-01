const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// POST for creating post
router.post("/new", postController.postCreate);

// POST for liking post
router.post("/:id/like", postController.postLike);

module.exports = router;