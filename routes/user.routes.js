import { Router } from "express";
import jwt from "jsonwebtoken"; // Import jwt
import { ApiError } from "../utils/ApiError.js"; // Import ApiError

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    changeCurrentPassword, 
    getCurrentUser,
    updateAccountDetails,
    changePasswordLogin
} from "../controllers/user.controller.js";
import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router(); 

router.post("/register", registerUser); 
router.route("/login").post(loginUser);
router.route("/change-password-login").patch(changePasswordLogin);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

// Fixed /current-user route
router.route("/current-user").get(verifyJWT, async function(req, res, next) {
    // Check if verifyJWT found a standard user
    if (!req.user) {
        try {
            // Fallback: Check if it is an Admin
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
            
            if (!token) {
                // If no token exists at all, throw error
                throw new ApiError(401, "Unauthorized request");
            }
        
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
            // Check Admin Collection
            const user = await Admin.findById(decodedToken?._id).select("-password -accessToken");
        
            if (!user) {
                throw new ApiError(401, "Invalid Access Token");
            }

            // If Admin found, return response immediately
            // We convert to object to safely append 'role' without modifying the DB document structure strictly
            const adminUser = user.toObject ? user.toObject() : user;
            adminUser.role = "admin";

            return res.status(200).json(
                new ApiResponse(
                    200,
                    adminUser, // Return the admin object directly
                    "Current user (Admin) fetched successfully"
                )
            );
        } catch (error) {
            // Pass errors to global error handler
            next(error);
        }
    } else {
        // If req.user exists (standard user found by verifyJWT), proceed to controller
        next();
    }
}, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

export default router;