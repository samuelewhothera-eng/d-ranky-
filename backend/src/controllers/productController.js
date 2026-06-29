const Product = require("../models/Product");

function createSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function listProducts(req, res) {
  const { category } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
}

async function createProduct(req, res) {
  try {
    const { name, description, category, price, stock, imageUrl } = req.body;
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "name, category, price, and stock are required." });
    }

    const slug = createSlug(name);
    const exists = await Product.findOne({ slug });
    if (exists) {
      return res.status(409).json({ message: "A product with this name already exists." });
    }

    const product = await Product.create({
      name,
      slug,
      description: description || "",
      category,
      price,
      stock,
      imageUrl: imageUrl || "",
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create product.", error: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.name) {
      payload.slug = createSlug(payload.name);
    }

    const product = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product.", error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    return res.json({ message: "Product archived successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to archive product.", error: error.message });
  }
}

module.exports = { listProducts, createProduct, updateProduct, deleteProduct };
