import { ApiError } from "./../utils/ApiError.js";
import { User } from "./../models/user.model.js";


/**
 * @author Shoyeb Ansari
 * Function to  verify token at current session
 */
export const verifyJWT = asyncHandler (async (req, res, next) => {

    try {
        // current access token
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorised reques");
        }

        // Decoded token
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Find user by id of the user which we can get from decodedToken         
        const user = await User.findById(decodeToken._id).select("-password -refreshToken");

        // If it doesn't exist remove it
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        
        // Creating new object named user of req object
        req.user = user;
        next(); // give flag to next middleware
    } catch (error) {
        throw new ApiError(error?.message || "Invalid access token");
    }
});