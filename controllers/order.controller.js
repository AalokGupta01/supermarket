import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js"; 
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js"; 

const validateDeliveryAddress = (address) => {
    const requiredFields = ['recipientName', 'mobileNumber', 'streetAddress', 'city', 'postalCode'];
    for (const field of requiredFields) {
        if (!address[field] || address[field].trim() === "") {
            return `Delivery address missing required field: ${field}.`;
        }
    }
    return null;
};

const placeOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const { 
        items, 
        deliveryAddress, 
        paymentMethod, 
        shippingFee = 0.0 
    } = req.body;

    // --- Validation ---
    if (!items || items.length === 0) {
        throw new ApiError(400, "Order must contain at least one item.");
    }
    if (!deliveryAddress) {
        throw new ApiError(400, "Delivery address is required.");
    }
    const addressError = validateDeliveryAddress(deliveryAddress);
    if (addressError) {
        throw new ApiError(400, addressError);
    }
    if (!['COD', 'UPI'].includes(paymentMethod)) {
         throw new ApiError(400, "Invalid payment method selected.");
    }
    
    let calculatedSubtotal = 0;
    const finalOrderItems = [];
    const productIds = items.map(item => item.productId);

    // Select 'pname' because your database uses that key
    const products = await Product.find({ _id: { $in: productIds } })
        .select("_id name pname price stock"); 

    const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = product;
        return map;
    }, {});

    const bulkStockUpdates = []; // To hold stock reduction operations

    for (const item of items) {
        const product = productMap[item.productId];

        if (!product) {
            throw new ApiError(400, `Product ${item.productId} does not exist.`);
        }

        // Helper to get the correct name for error messages
        const currentProductName = product.pname || product.name || "Unknown Product";

        // 1. Check Stock
        if (product.stock < item.quantity) {
            throw new ApiError(400, `Product '${currentProductName}' is out of stock or insufficient quantity.`);
        }
        
        const verifiedUnitPrice = product.price;
        const itemTotal = verifiedUnitPrice * item.quantity;
        calculatedSubtotal += itemTotal;

        finalOrderItems.push({
            productId: item.productId,
            // Assign 'pname' to 'name' for the Order Schema
            name: product.pname || product.name, 
            quantity: item.quantity,
            unitPrice: verifiedUnitPrice,
        });

        // 2. Prepare Stock Deduction (for bulk write)
        bulkStockUpdates.push({
            updateOne: {
                filter: { _id: product._id },
                update: { $inc: { stock: -item.quantity } } // Decrease stock
            }
        });
    }

    const totalAmount = calculatedSubtotal + shippingFee;
    const paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Pending'; 

    // 3. Create Order
    const newOrder = await Order.create({
        user: userId,
        items: finalOrderItems,
        deliveryAddress: {
            recipientName: deliveryAddress.recipientName,
            mobileNumber: deliveryAddress.mobileNumber,
            streetAddress: deliveryAddress.streetAddress,
            apartment: deliveryAddress.apartment || null,
            city: deliveryAddress.city,
            postalCode: deliveryAddress.postalCode,
        },
        subtotal: calculatedSubtotal,
        shippingFee: shippingFee,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        orderStatus: 'Pending',
    });

    if (!newOrder) {
        throw new ApiError(500, "Order creation failed. Database error.");
    }

    // 4. Execute Stock Deduction
    if (bulkStockUpdates.length > 0) {
        await Product.bulkWrite(bulkStockUpdates);
    }

    // 5. Clear the User's Cart
    await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: [], totalAmount: 0 } }
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                newOrder, 
                "Order placed successfully."
            )
        );
});

const getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                orders,
                "User orders fetched successfully"
            )
        );
});

export {
    placeOrder,
    getUserOrders 
};