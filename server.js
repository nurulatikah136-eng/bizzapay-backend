const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Load .env if testing locally

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Guna environment variable dari Render atau .env
const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

// Root endpoint
app.get('/', (req, res) => {
  res.send('ToyyibPay backend is running ✅');
});

// Checkout endpoint
app.post('/checkout', async (req, res) => {
  try {
    const { name, email, phone, amount, description } = req.body;

    if (!name || !email || !phone || !amount || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const senAmount = Math.round(parseFloat(amount) * 100); // Convert RM to sen

    const payload = new URLSearchParams({
      userSecretKey: secretKey,
      categoryCode: categoryCode,
      billName: description,
      billDescription: description,
      billPriceSetting: 1,
      billPayorInfo: 1,
      billAmount: senAmount,
      billReturnUrl: 'https://google.com', // Ganti dengan URL kau
      billCallbackUrl: 'https://google.com', // Ganti dengan URL kau
      billExternalReferenceNo: 'BILL' + Date.now(),
      billTo: name,
      billEmail: email,
      billPhone: phone,
      billSplitPayment: 0,
      billDisplayMerchant: 1,
    });

    const response = await axios.post('https://dev.toyyibpay.com/index.php/api/createBill', payload);

    const billCode = response.data[0]?.BillCode;

    if (!billCode) {
      return res.status(500).json({ message: 'No BillCode returned' });
    }

    const paymentUrl = `https://dev.toyyibpay.com/${billCode}`;

    res.json({
      message: 'Bill created successfully',
      billCode,
      paymentUrl,
    });
  } catch (error) {
    console.error('Checkout error:', error.message);
    res.status(500).json({
      message: 'Checkout failed',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
