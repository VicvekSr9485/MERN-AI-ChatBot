import { randomUUID } from "crypto";
import mongoose from 'mongoose';

// Extract Schema from mongoose
const { Schema } = mongoose;

const chatSchema = new Schema({
    id: {
        type: String,
        default: randomUUID,
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant'], // Gemini uses these roles
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

const userSchema = new Schema({
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
        select: false
    },
    chats: [chatSchema],
}, {
    timestamps: true
});

// Add indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: 1 });

// Create and export the model
const User = mongoose.model("User", userSchema);
export default User;