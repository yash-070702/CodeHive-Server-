const mongoose=require("mongoose");
const mailSender=require("../utils/mailSender");
const emailTemplate=require('../mail/templates/emailVerificationTemplate');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,  // Automatically set to current date and time when the document is created
        expires: '5m'       // TTL index to delete documents 5 minutes after creation
    }
});
module.exports = mongoose.model('OTP', OTPSchema);