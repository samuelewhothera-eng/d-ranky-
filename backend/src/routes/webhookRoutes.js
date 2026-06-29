const express = require("express");
const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendOrderConfirmation } = require("../services/emailService");

const router = express.Router();

router.post("/paystack", express.raw({ type: "application/json" }), async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"];

  if (!secret || !signature) return res.status(400).json({ message: "Missing secret or signature." });

  const hash = crypto.createHmac("sha512", secret).update(req.body).digest("hex");
  if (hash !== signature) return res.status(401).json({ message: "Invalid signature." });

  let event;
  try { event = JSON.parse(req.body.toString()); }
  catch { return res.status(400).json({ message: "Invalid JSON body." }); }

  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const order = await Order.findOne({ paymentReference: reference });

    if (order && order.status === "pending_payment") {
      order.status = "paid";
      order.paymentVerifiedAt = new Date();
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }

      const user = await User.findById(order.user);
      if (user) {
        sendOrderConfirmation({
          toEmail: user.email,
          toName: user.fullName,
          trackingId: order.trackingId,
          items: order.items,
          amount: order.amount,
          shippingAddress: order.shippingAddress,
        }).catch((e) => console.error("Webhook email error:", e.message));
      }
    }
  }

  return res.status(200).json({ received: true });
});

module.exports = router;
