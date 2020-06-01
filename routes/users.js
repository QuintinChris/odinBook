var express = require('express');
var router = express.Router();
var userController = require("../controllers/userController");


// GET  all users
router.get("/", userController.allUsers);

// GET user profile
router.get("/:id/profile", userController.userProfile);

// GET users timeline
//router.get("/timeline", userController.userTimeline);

// GET users friend list
router.get("/:id/friends", userController.userFriends);

// GET logged in users friend requests
router.get("/friend-requests", userController.userFriendRequests);

module.exports = router;
