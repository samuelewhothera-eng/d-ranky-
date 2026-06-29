require("dotenv").config();
const { connectDb } = require("../config/db");
const Product = require("../models/Product");

function slug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const products = [
  // ── Entry Collection (budget, under ₦15,000)
  { name: "Street Tee", description: "Comfortable everyday tee with D RANKY branding.", category: "clothes", price: 8000, stock: 50 },
  { name: "Rank Cap", description: "Sleek cap to complete any look.", category: "accessories", price: 5000, stock: 40 },
  { name: "Classic Polo", description: "Clean polo shirt, premium cotton blend.", category: "clothes", price: 12000, stock: 35 },
  { name: "Logo Socks", description: "Signature D RANKY logo socks.", category: "accessories", price: 3000, stock: 100 },
  { name: "Casual Shorts", description: "Lightweight casual shorts for everyday wear.", category: "clothes", price: 9500, stock: 30 },
  { name: "Basic Hoodie", description: "Warm everyday hoodie.", category: "clothes", price: 14000, stock: 25 },

  // ── Premium Collection (mid, ₦15,000–₦40,000)
  { name: "Signature Shirt", description: "Refined button-down with subtle D RANKY detailing.", category: "clothes", price: 22000, stock: 20 },
  { name: "Premium Jogger", description: "High-waist jogger crafted for comfort and style.", category: "clothes", price: 18000, stock: 20 },
  { name: "Heritage Jacket", description: "Timeless jacket with structured shoulders.", category: "jackets", price: 38000, stock: 15 },
  { name: "Rank Blazer", description: "Sharp blazer for formal and semi-formal occasions.", category: "jackets", price: 35000, stock: 10 },
  { name: "Elite Turtleneck", description: "Luxury turtleneck in heavyweight fabric.", category: "clothes", price: 25000, stock: 18 },
  { name: "D RANKY Chinos", description: "Tailored chinos with a slim, modern fit.", category: "clothes", price: 28000, stock: 20 },

  // ── Signature Reserve (luxury, ₦40,000+)
  { name: "Atelier Suit", description: "Bespoke two-piece suit, handcrafted to order.", category: "clothes", price: 85000, stock: 5 },
  { name: "Reserve Leather Jacket", description: "Full-grain leather jacket — a statement piece.", category: "jackets", price: 120000, stock: 3 },
  { name: "Gold Edition Set", description: "Exclusive matching set with gold-thread embroidery.", category: "clothes", price: 60000, stock: 7 },
  { name: "Bespoke Overcoat", description: "Long overcoat in fine wool, fully lined.", category: "jackets", price: 95000, stock: 4 },
  { name: "Ranked Collection Tux", description: "Signature tuxedo for those who lead every room.", category: "clothes", price: 110000, stock: 3 },
  { name: "Grand Reserve Ensemble", description: "Our most exclusive piece — limited quantities.", category: "clothes", price: 150000, stock: 2 },
];

async function seedProducts() {
  try {
    await connectDb();

    let created = 0;
    let skipped = 0;

    for (const p of products) {
      const s = slug(p.name);
      const exists = await Product.findOne({ slug: s });
      if (exists) { skipped++; continue; }
      await Product.create({ ...p, slug: s });
      created++;
    }

    console.log(`Done. Created: ${created}, Skipped (already exist): ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seedProducts();
