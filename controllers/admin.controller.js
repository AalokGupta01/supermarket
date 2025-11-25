import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Admin } from "../models/admin.model.js"
import { Seller } from "../models/seller.model.js"
import { Product } from "../models/product.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccess = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId)
        const accessToken = admin.generateAccessToken()

        admin.accessToken = accessToken
        await admin.save({ validateBeforeSave: false })

        return { accessToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token")
    }
}

const registerAdmin = asyncHandler(async (req, res) => {
    const { email, username, password, fullName, secretKey } = req.body;

    // Optional: Security check to prevent public admin registration
    // if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    //     throw new ApiError(403, "Forbidden: Invalid Admin Secret Key");
    // }

    if (
        [email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedAdmin = await Admin.findOne({
        $or: [{ username }, { email }]
    })

    if (existedAdmin) {
        throw new ApiError(409, "Admin with email or username already exists")
    }

    const admin = await Admin.create({
        email,
        password,
        username: username.toLowerCase(),
        fullName
    })

    const createdAdmin = await Admin.findById(admin._id).select(
        "-password"
    )

    if (!createdAdmin) {
        throw new ApiError(500, "Something went wrong while registering the admin")
    }

    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "Admin registered Successfully")
    )
})

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const admin = await Admin.findOne({
        $or: [{ username }, { email }]
    })

    if (!admin) {
        throw new ApiError(404, "Admin does not exist")
    }

    const isPasswordValid = await admin.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid admin credentials")
    }

    const { accessToken } = await generateAccess(admin._id)

    const loggedInAdmin = await Admin.findById(admin._id).select("-password")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    admin: loggedInAdmin, accessToken
                },
                "Admin logged In Successfully"
            )
        )
})

const logoutAdmin = asyncHandler(async (req, res) => {
    await Admin.findByIdAndUpdate(
        req.user._id, // Assumes auth middleware sets req.user (or req.admin)
        {
            $unset: {
                accessToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "Admin logged Out"))
})

// New Function: Get All Sellers for Admin Dashboard
const getAllSellers = asyncHandler(async (req, res) => {
    const sellers = await Seller.find({}).select("-password -accessToken");
    
    return res
        .status(200)
        .json(new ApiResponse(200, sellers, "Sellers fetched successfully"));
});

// New Function: Get Category Stats (Aggregation)
const getCategoryStats = asyncHandler(async (req, res) => {
    // Aggregate products to count how many items exist per category
    const stats = await Product.aggregate([
        {
            $group: {
                _id: "$category", // Group by category field
                count: { $sum: 1 } // Count occurrences
            }
        },
        {
            $sort: { _id: 1 } // Sort alphabetically
        }
    ]);

    // Transform null _id to "Uncategorized" if necessary
    const formattedStats = stats.map(stat => ({
        name: stat._id || "Uncategorized",
        varieties: stat.count,
        restock: "Weekly" // Hardcoded as logic for restock isn't in DB yet
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, formattedStats, "Category stats fetched"));
});

const getAdmin = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "Admin fetched successfully"
        ))
});

export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    getAllSellers,    // Export new function
    getCategoryStats,  // Export new function
    getAdmin
}