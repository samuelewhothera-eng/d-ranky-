const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { initializePayment, verifyPayment } = require("../services/paystackService");
const { sendOrderConfirmation } = require("../services/emailService");
const { generateTrackingId } = require("../utils/tracking");

async function createOrder(req, res) {
  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ message: "items and shippingAddress are required." });
    }

    const builtItems = [];
    let amount = 0;

    for (const entry of items) {
      const product = await Product.findById(entry.productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: `Product not found: ${entry.productId}` });
      }
      if (product.stock < entry.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}.` });
      }
      const lineTotal = product.price * entry.quantity;
      amount += lineTotal;
      builtItems.push({ product: product._id, name: product.name, unitPrice: product.price, quantity: entry.quantity, lineTotal });
    }

    const paymentReference = `DRK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const trackingId = generateTrackingId();

    const order = await Order.create({
      user: req.user._id,
      items: builtItems,
      amount,
      paymentReference,
      trackingId,
      shippingAddress,
    });

    const callbackUrl =
      process.env.PAYSTACK_CALLBACK_URL ||
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/verify`;

    const paymentInit = await initializePayment({
      email: req.user.email,
      amount,
      reference: paymentReference,
      callbackUrl,
      metadata: { orderId: String(order._id), trackingId: order.trackingId, customerId: String(req.user._id) },
    });

    return res.status(201).json({
      message: "Order created. Complete payment with Paystack.",
      orderId: order._id,
      trackingId: order.trackingId,
      amount: order.amount,
      payment: paymentInit.data,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create order.", error: error.message });
  }
}

async function verifyOrderPayment(req, res) {
  try {
    const { reference } = req.params;
    const paymentResult = await verifyPayment(reference);
    const order = await Order.findOne({ paymentReference: reference });

    if (!order) return res.status(404).json({ message: "Order not found for reference." });

    if (paymentResult.data.status !== "success") {
      return res.status(400).json({ message: "Payment not successful yet.", payment: paymentResult.data });
    }

    if (order.status === "pending_payment") {
      order.status = "paid";
      order.paymentVerifiedAt = new Date();
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }

      // Send confirmation email
      const user = await User.findById(order.user);
      if (user) {
        sendOrderConfirmation({
          toEmail: user.email,
          toName: user.fullName,
          trackingId: order.trackingId,
          items: order.items,
          amount: order.amount,
          shippingAddress: order.shippingAddress,
        }).catch((e) => console.error("Email error:", e.message));
      }
    }

    return res.json({ message: "Payment verified.", orderId: order._id, trackingId: order.trackingId, status: order.status });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify payment.", error: error.message });
  }
}

async function getMyOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}

async function trackOrder(req, res) {
  const { trackingId } = req.params;
  const order = await Order.findOne({ trackingId, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  return res.json({ trackingId: order.trackingId, status: order.status, updatedAt: order.updatedAt, items: order.items });
}

async function adminListOrders(req, res) {
  const orders = await Order.find().populate("user", "fullName email").sort({ createdAt: -1 });
  res.json(orders);
}

async function adminUpdateOrder(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status transition." });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    order.status = status;
    await order.save();
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order.", error: error.message });
  }
}

module.exports = { createOrder, verifyOrderPayment, getMyOrders, trackOrder, adminListOrders, adminUpdateOrder };
