const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");
const {
    createInterest,
    getNotifications,
    markAsRead
} = require("../controllers/interestController");

// Interest routes
router.post("/interests/create", auth, createInterest);

// Notification routes
router.get("/notifications/my", auth, getNotifications);
router.put("/notifications/mark-read", auth, markAsRead);

module.exports = router;
