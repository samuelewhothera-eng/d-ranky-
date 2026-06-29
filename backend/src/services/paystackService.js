const axios = require("axios");

function getHeaders() {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is missing.");
  }
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

async function initializePayment({ email, amount, reference, callbackUrl, metadata }) {
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email,
      amount: Math.round(amount * 100), // Paystack works in kobo
      reference,
      callback_url: callbackUrl,
      metadata,
    },
    { headers: getHeaders() }
  );
  return response.data;
}

async function verifyPayment(reference) {
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: getHeaders() }
  );
  return response.data;
}

module.exports = { initializePayment, verifyPayment };
