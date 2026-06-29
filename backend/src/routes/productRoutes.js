const express = require("express");
const { listProducts, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { protect, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", listProducts);
router.post("/", protect, requireAdmin, createProduct);
router.patch("/:id", protect, requireAdmin, updateProduct);
router.delete("/:id", protect, requireAdmin, deleteProduct);

module.exports = router;
