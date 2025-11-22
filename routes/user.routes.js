import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    changeCurrentPassword, 
    getCurrentUser,
    updateAccountDetails
    // sendEmail
} from "../controllers/user.controller.js";

const router = Router(); 

router.post("/register", registerUser); 
router.route("/login").post(loginUser);
// router.route("/send-email").post(sendEmail);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

export default router;