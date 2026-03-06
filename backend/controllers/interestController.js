const Interest = require("../models/Interest");
const Notification = require("../models/Notification");
const FarmerPost = require("../models/FarmerPost");

// Create interest
exports.createInterest = async (req, res) => {
    try {
        const { postId, farmerId, message } = req.body;
        const buyerId = req.user.id;

        if (buyerId === farmerId) {
            return res.status(400).json({ error: "You cannot express interest in your own post" });
        }

        // Check if interest already exists
        const existing = await Interest.findOne({ postId, buyerId });
        if (existing) {
            return res.status(400).json({ error: "Interest already expressed" });
        }

        const interest = new Interest({
            postId,
            buyerId,
            farmerId,
            message
        });

        await interest.save();

        // Create notification for farmer
        const post = await FarmerPost.findById(postId);
        const notification = new Notification({
            recipientId: farmerId,
            senderId: buyerId,
            title: "New Interest Expressed",
            message: `A buyer is interested in your post: ${post.cropName}`,
            type: "interest"
        });
        await notification.save();

        console.log(`💚 Interest created by ${buyerId} for post ${postId}`);
        res.status(201).json({ message: "Interest expressed successfully", interest });
    } catch (error) {
        console.error("Error creating interest:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get my notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Mark as read
exports.markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user.id, readStatus: false },
            { $set: { readStatus: true } }
        );
        res.json({ message: "Notifications marked as read" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
