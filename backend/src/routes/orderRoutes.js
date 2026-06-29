const express = require("express");
const {
  createOrder,
  verifyOrderPayment,
  getMyOrders,
  trackOrder,
  adminListOrders,
  adminUpdateOrder,
} = require("../controllers/orderController");
const { protect, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/track/:trackingId", protect, trackOrder);
router.get("/verify/:reference", protect, verifyOrderPayment);

router.get("/admin/all", protect, requireAdmin, adminListOrders);
router.patch("/admin/:id/status", protect, requireAdmin, adminUpdateOrder);

module.exports = router;
