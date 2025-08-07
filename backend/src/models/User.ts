import { randomUUID } from "crypto";
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    id: {
        type: String,
        default: randomUUID,
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant', 'system'], // Validate role values
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
}, {
    _id: false // Don't create _id for subdocuments
});

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        select: false // Don't return password by default
    },
    chats: [chatSchema],
}, {
    timestamps: true // Add createdAt and updatedAt
});

// Add indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: 1 });

export default mongoose.model("User", userSchema);