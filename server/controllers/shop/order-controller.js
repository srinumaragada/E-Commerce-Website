require("dotenv").config();
const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const PAYPAL_RETURN_URL = process.env.PAYPAL_RETURN_URL_DEV;
const PAYPAL_CANCEL_URL = process.env.PAYPAL_CANCEL_URL_DEV;

const createOrder = async (req, res) => {
  try {
    const { userId, cartItems, totalAmount, cartId } = req.body;

    if (!cartItems || !cartItems.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const create_payment_json = {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: { return_url: PAYPAL_RETURN_URL, cancel_url: PAYPAL_CANCEL_URL },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: { currency: "USD", total: totalAmount.toFixed(2) },
          description: "Order Payment",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.error("PayPal Error:", error);
        return res.status(500).json({ success: false, message: "PayPal error" });
      }

      const approvalURL = paymentInfo.links.find((link) => link.rel === "approval_url").href;

      const newlyCreatedOrder = new Order(req.body);
      await newlyCreatedOrder.save();

      res.status(201).json({ success: true, approvalURL, orderId: newlyCreatedOrder._id });
    });
  } catch (e) {
    console.error("Create Order Error:", e);
    res.status(500).json({ success: false, message: "Internal server error", error: e.message });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${item.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);
    await order.save();

    res.status(200).json({ success: true, message: "Order confirmed", data: order });
  } catch (e) {
    console.error("Capture Payment Error:", e);
    res.status(500).json({ success: false, message: "Internal server error", error: e.message });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });
    if (!orders.length) {
      return res.status(404).json({ success: false, message: "No orders found!" });
    }
    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.error("Get Orders Error:", e);
    res.status(500).json({ success: false, message: "Internal server error", error: e.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.error("Get Order Details Error:", e);
    res.status(500).json({ success: false, message: "Internal server error", error: e.message });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
