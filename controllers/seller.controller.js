import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Seller } from "../models/seller.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccess = async (sellerId) => {
    try {
        const seller = await Seller.findById(sellerId)
        const accessToken = seller.generateAccessToken()

        seller.accessToken = accessToken
        await seller.save({ validateBeforeSave: false })

        return { accessToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token")
    }
}

const registerSeller = asyncHandler(async (req, res) => {
    // Added storeName and phoneNumber to registration
    const { email, username, password, storeName, phoneNumber } = req.body;

    if (
        [email, username, password, storeName, phoneNumber].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields (Email, User, Pass, Store Name, Phone) are required")
    }

    const existedSeller = await Seller.findOne({
        $or: [{ username }, { email }]
    })

    if (existedSeller) {
        throw new ApiError(409, "Seller with email or username already exists")
    }

    const seller = await Seller.create({
        email,
        password,
        username: username.toLowerCase(),
        storeName,
        phoneNumber
    })

    const createdSeller = await Seller.findById(seller._id).select(
        "-password"
    )

    if (!createdSeller) {
        throw new ApiError(500, "Something went wrong while registering the seller")
    }

    return res.status(201).json(
        new ApiResponse(200, createdSeller, "Seller registered Successfully")
    )
})

const loginSeller = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const seller = await Seller.findOne({
        $or: [{ username }, { email }]
    })

    if (!seller) {
        throw new ApiError(404, "Seller does not exist")
    }

    const isPasswordValid = await seller.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid seller credentials")
    }

    const { accessToken } = await generateAccess(seller._id)

    const loggedInSeller = await Seller.findById(seller._id).select("-password")

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
                    seller: loggedInSeller, accessToken
                },
                "Seller logged In Successfully"
            )
        )
})

const logoutSeller = asyncHandler(async (req, res) => {
    await Seller.findByIdAndUpdate(
        req.user._id, // Assumes auth middleware populates req.user with seller details
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
        .json(new ApiResponse(200, {}, "Seller logged Out"))
})

// Optional: Seller specific controller to update store details
const updateStoreDetails = asyncHandler(async (req, res) => {
    const { storeName, storeDescription, phoneNumber } = req.body;

    const seller = await Seller.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                storeName,
                storeDescription,
                phoneNumber
            }
        },
        { new: true }
    ).select("-password -accessToken")

    return res
        .status(200)
        .json(new ApiResponse(200, seller, "Store details updated"))
})

export {
    registerSeller,
    loginSeller,
    logoutSeller,
    updateStoreDetails
}