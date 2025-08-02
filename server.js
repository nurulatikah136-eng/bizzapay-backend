const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('ToyyibPay backend is running.');
});

// Checkout endpoint
app.post('/checkout', async (req, res) => {
  try {
    const { name, email, phone, amount } = req.body;

    // Validate request
    if (!name || !email || !phone || !amount) {
      return res.status(400).json({ status: 'error', msg: 'Missing required fields' });
    }

    // Use secret key from Render environment variable
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE || 'ynz2durg'; // default value if not set

    if (!secretKey) {
      return res.status(500).json({ status: 'error', msg: 'userSecretKey is not set' });
    }

    const billData = {
      userSecretKey: secretKey,
      categoryCode: categoryCode,
      billName: 'Product Purchase',
      billDescription: 'Payment via ToyyibPay',
      billPriceSetting: 1,
      billPayorInfo: 1,
      billAmount: amount, // in ringgit (e.g., 180.00)
      billReturnUrl: 'https://yourwebsite.com/return',
      billCallbackUrl: 'https://yourwebsite.com/callback',
      billExternalReferenceNo: 'REF' + Date.now(),
      billTo: name,
      billEmail: email,
      billPhone: phone
    };

    // Create bill
    const response = await axios.post('https://dev.toyyibpay.com/index.php/api/createBill', new URLSearchParams(billData));

    if (Array.isArray(response.data) && response.data[0].BillCode) {
      const billCode = response.data[0].BillCode;
      const paymentUrl = `https://dev.toyyibpay.com/${billCode}`;
      return res.status(200).json({ status: 'success', url: paymentUrl });
    } else {
      return res.status(500).json({ status: 'error', msg: 'No BillCode returned', raw: response.data });
    }

  } catch (err) {
    console.error('Checkout error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Checkout failed',
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
