const User = require('../models/User.model');

const reputationPoints = {
    upvote: 10,
    downvote: -2,
    answerAccepted: 15,
    newQuestion: 2,
    newAnswer: 1,
    questionDeleted: -2,
    answerDeleted: -15,       
    answerRemovedFromQuestion: -1, 
    removeUpvote: -10 
};

exports.updateUserReputation = async (userId, action) => {
    try {
        if (!reputationPoints[action]) return; // Ignore invalid actions

        const user = await User.findById(userId);
        if (!user) return console.error("User not found");

        let newReputation = user.reputation + reputationPoints[action];

        // Prevent negative reputation
        newReputation = Math.max(newReputation, 0);

        await User.findByIdAndUpdate(userId, { reputation: newReputation });
    } catch (error) {
        console.error("Error updating user reputation:", error);
    }
};
