const express = require("express");
const router = express.Router({ mergeParams: true }); // https://cedric.tech/blog/expressjs-accessing-req-params-from-child-routers/
const friendController = require("../controllers/friendController");

// Check if function names are correct

// POST for create friendship
router.post("/:id/new", friendController.friendshipCreate);

// POST to accept friend request
router.post("/:id/accept", friendController.friendshipEdit);

module.exports = router;