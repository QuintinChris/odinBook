var express = require('express');
var router = express.Router();
var usersController = require("../controllers/usersController");


// GET  all users
router.get("/", usersController.allUsers);

// GET user profile
router.get("/:id/profile", usersController.userProfile);

// GET users timeline
router.get("/timeline", usersController.userTimeline);

// GET users friend list
router.get("/:id/friends", usersController.userFriends);

// GET request for logged in users friend requests
router.get("/friend-requests", usersController.userFriendRequests);

module.exports = router;
