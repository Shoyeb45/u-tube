import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log(req);

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
    const bannerImageLocalPath = req.files?.banner[0]?.path;
    
    
    if (!avatarLocalPath) {
        console.log("Local upload");
        throw new ApiError(400, "Avatar file is reqired");  // Throw the error if does not exist
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);               // Upload the file in cloudinary
    const bannerImage = await uploadOnCloudinary(bannerImageLocalPath);
    
    // Check if avatar is uploaded or not
    if (!avatar) {
        console.log("cloud upload");
        throw new ApiError(400, "Avatar file is reqired");
    }
    console.log("avatar response" + "\n",avatar);
    
    // Upload data in schema
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: bannerImage?.url ||  "",  // check if the user have given banner url 
        email,
        password,
        username: username.toLowerCase()
    });

    // Check if the user is really selected
    const isUserCreated = await User.findById(user._id).select(
        "-password -refreshTokem" // give the column name which we need to exclude by -Column1 -column2 ....
    );

    // If something went wrong, it's our mistake so, error code should be from server side 
    if (!isUserCreated) {
        throw new ApiError("500", "Something went wrong from our side while registering, please try once more.");
    }

    // Send response using our ApiResponse class
    return res.status(201).json(new ApiResponse(200, isUserCreated, "User registered succefully"));  
});


export  { registerUser } ; 