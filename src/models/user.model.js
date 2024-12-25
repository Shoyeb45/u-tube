import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
 
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

// To encypt the password. : as we are using `this`, so don't use arrow functions - as they don't allow use of `this` and since bcryptjs uses some cryptographic algorithm, and it is computational so we will use async and await
userSchema.pre("save", async function(next) {
    // First check if password field is modified or not
    if (!this.isModified("password")) {
        return next();
    }

    // hash method will take password and encrypt it by using some algorithm.
    this.password = await bcryptjs.hash(this.password, 10);
    next();
});


// function for checking the password, we can define method for our schema
// schema.methods.anyName, if anyName does not exist it will create a method for our schema.
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcryptjs.compare(password, this.password);
}

// Function for generating access token
userSchema.methods.generateAccessToken = function() {
    // We'll use sign method which takes three arguments
    return jwt.sign(
        {
            _id: this._id, // id from database  
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        // Secret code which it will use to generate
        process.env.ACCESS_TOKEN_SECRET,
        // Give expiry in object form
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Function for generating refresh token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id, // id from database  
        },
        // Secret code which it will use to generate
        process.env.REFRESH_TOKEN_SECRET,
        // Give expiry in object form
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );

};
export const User = mongoose.model("User", userSchema);

