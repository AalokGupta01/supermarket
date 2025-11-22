import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Address } from "../models/address.model.js"; // Assuming you created this model
import { User } from "../models/user.model.js"; // Assuming you have the User model imported

// Helper function to validate required address fields
const validateAddressFields = (addressData) => {
    const requiredFields = ['recipientName', 'mobileNumber', 'streetAddress', 'city', 'postalCode'];
    for (const field of requiredFields) {
        if (!addressData[field] || addressData[field].trim() === "") {
            return `Missing required field: ${field}.`;
        }
    }
    return null;
};

// =========================================================================
// 1. Save a New Address (POST /address/save)
// =========================================================================

const saveAddress = asyncHandler(async (req, res) => {
    // req.user is available via verifyJWT middleware
    const userId = req.user._id; 
    
    // Extract fields from the request body (Flutter form)
    const { 
        recipientName, 
        mobileNumber, 
        streetAddress, 
        apartment, // Optional
        city, 
        postalCode,
        isDefault = false // Comes from the "Save address for future use" checkbox
    } = req.body;

    const validationError = validateAddressFields(req.body);
    if (validationError) {
        throw new ApiError(400, validationError);
    }
    
    // 1. Create the new address document
    const newAddress = await Address.create({
        owner: userId,
        recipientName,
        mobileNumber,
        streetAddress,
        apartment,
        city,
        postalCode,
        isDefault
    });

    if (!newAddress) {
        throw new ApiError(500, "Failed to save address. Please try again.");
    }
    
    // 2. Add the address reference to the User's document
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $push: { savedAddresses: newAddress._id }
        },
        { new: true }
    );
    
    if (!user) {
        // Highly unlikely if the token is valid, but good to handle
        await Address.findByIdAndDelete(newAddress._id); // Rollback address creation
        throw new ApiError(404, "User not found.");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                newAddress, 
                "Address saved and linked to user successfully"
            )
        );
});

// =========================================================================
// 2. Get All Saved Addresses (GET /address/all)
// =========================================================================

const getSavedAddresses = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Retrieve the user and populate the savedAddresses field
    const userWithAddresses = await User.findById(userId).populate({
        path: 'savedAddresses',
        model: 'Address',
        // Optional: Select only the necessary fields for the list view
        select: '-owner -createdAt -updatedAt -__v' 
    });

    if (!userWithAddresses) {
        throw new ApiError(404, "User not found.");
    }

    const savedAddresses = userWithAddresses.savedAddresses || [];

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                savedAddresses, 
                "Saved addresses fetched successfully"
            )
        );
});

// =========================================================================
// 3. Delete a Saved Address (DELETE /address/:addressId)
// =========================================================================

const deleteAddress = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { addressId } = req.params;

    if (!addressId) {
        throw new ApiError(400, "Address ID is required.");
    }

    // 1. Delete the address document
    const deletedAddress = await Address.findOneAndDelete({
        _id: addressId,
        owner: userId // Ensure only the owner can delete the address
    });

    if (!deletedAddress) {
        throw new ApiError(404, "Address not found or does not belong to user.");
    }

    // 2. Remove the address reference from the User's document
    await User.findByIdAndUpdate(
        userId,
        {
            $pull: { savedAddresses: addressId }
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Address deleted successfully")
        );
});

export {
    saveAddress,
    getSavedAddresses,
    deleteAddress
};