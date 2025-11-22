import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Assumed middleware
import { 
    saveAddress, 
    getSavedAddresses,
    deleteAddress
} from "../controllers/address.controller.js";

const router = Router();
router.use(verifyJWT);
router.route("/save").post(saveAddress);
router.route("/all").get(getSavedAddresses);
router.route("/:addressId").delete(deleteAddress); 

export default router;