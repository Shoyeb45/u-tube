import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: false,
        lowercase: true,
        trim: true,
        index: true // for searching 
    },
    email: {
        type: String,
        required: true,
        unique: false,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,  // cloudinary service
        required: true,
    },
    coverImage: {
        type: String,  // cloudinary service
    },
    watchHistory: {
        type: [
            { 
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshTokem: {
        type: String
    }
}, {timestamps: true});

export const User = mongoose.model("User", userSchema);

