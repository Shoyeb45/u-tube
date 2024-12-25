import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


/**
 * 
 * @author Shoyeb Ansari
 * @param {*} user : databse object of userSchema
 * @returns Access token and Refresh Token
 */
const generateRefreshAndAccessToken = async (userId) => {
    try {
        // Generate tokens
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        // Update refresh tokens
        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false
        });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wronog while generating access and refresh token");
    }
};

/**
 * Function for registering user
 * 
 * Problem breakdown:
 * 1. Get user details from frontend
 * 2. Validating data - not empty
 * 3. Check if user already exist: through username and email
 * 4. Check for images, check for avatar
 * 5. Upload them in a cloudinary
 * 6. Create user object - create entry in db
 * 7. Remove password and refresh token field from response
 * 8. Check for user creation
 * 9. return response
 */
const registerUser = asyncHandler( async (req, res) => {
    // console.log(req);

    // 1. Getting user detail
    const {username, email, password, fullname} = req.body;

    
    // 2. Data validation
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })


    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist");
    }

    // 4. Cover Image and banner
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath = "";

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    

    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is reqired");  // Throw the error if does not exist
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);               // Upload the file in cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    // Check if avatar is uploaded or not
    if (!avatar) {
        throw new ApiError(400, "Avatar file is reqired");
    }
    
    // Upload data in schema
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url ||  "",  // check if the user have given banner url 
        email,
        password,
        username: username.toLowerCase()
    });

    // Check if the user is really selected
    const isUserCreated = await User.findById(user._id).select(
        "-password -refreshToken" // give the column name which we need to exclude by -Column1 -column2 ....
    );

    // If something went wrong, it's our mistake so, error code should be from server side 
    if (!isUserCreated) {
        throw new ApiError("500", "Something went wrong from our side while registering, please try once more.");
    }

    // Send response using our ApiResponse class
    return res.status(201).json(new ApiResponse(200, isUserCreated, "User registered succefully"));  
});


/**
 * Function for making user login
 * 
 * @author Shoyeb Ansari
 * Problem breakdown:
 * 1. Get the data from user, i.e., username and password
 * 2. Check if the username exist, if not then give that error
 * 3. If exist then get the _id of the user, and then get the encrypted password
 * 4. Convert the given password to encrypted password
 * 5. Compare the both password 
 * 6. Access and refresh token
 * 7. Send cookie
 */
const loginUser = asyncHandler ( async (req, res) => {
    // 1. get the data
    // console.log(req.query);
    
    const { username, password } = req.body;
    console.log(username);
    
    if (!username) {
        throw new ApiError(400, "Username is required.");
    }
    // 2. check the user
    const user = await User.findOne({username});

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Password is incorrect");
    }

    // Update tokens
    const {refreshToken, accessToken} = await generateRefreshAndAccessToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true      
    };
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
});


/**
 * Function to log out the user.
 * 
*/
const logoutUser = asyncHandler (async (req, res) => {
    await User.findByIdAndUpdate(  // this method will find and update the databse
        req.user._id,
        {
            $set: { // set is operator which allows us to set the field
                refreshToken: undefined
            }
        },
        {
            new: true   // return value will be update 
        }
    );
    
    const options = {
        httpOnly: true,
        secure: true      
    };
    

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});


/**
 * Function for refreshing access tokens
 */
const refreshAccessToken = asyncHandler (async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; // another one is for mobile app

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorised access");
    }

    try {
        // Get decoded token of refresh token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        
        // Get user object
        const user = await User.findById(decodedToken?._id);

        // Throw error if it does not exist
        if (!user) {
            throw new ApiError(401, "Inalid refresh token");
        }
        
        // Check both the tokens
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }
        
        const option = {
            httpOnly: true,
            secure: true
        };
        
        // Get new refresh and access tokens
        const {newRefreshToken, accessToken} = await generateRefreshAndAccessToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", newRefreshToken)
            .json(
                new ApiResponse(
                    200,
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

});

// export functions
export { 
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken
}; 