const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ENV VARS
const TOYYIBPAY_CATEGORY_CODE = process.env.CATEGORY_CODE;
const TOYYIBPAY_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY;

// API Endpoint
const TOYYIBPAY_API = 'https://dev.toyyibpay.com/index.php/api/createBill';

// Route
app.post('/checkout', async (req, res) => {
  try {
    const { buyer_name, buyer_email, amount, reference } = req.body;

    const form = new URLSearchParams();
    form.append('userSecretKey', TOYYIBPAY_SECRET_KEY);
    form.append('categoryCode', TOYYIBPAY_CATEGORY_CODE);
    form.append('billName', 'Order #' + reference);
    form.append('billDescription', 'Payment for order #' + reference);
    form.append('billPriceSetting', 1);
    form.append('billPayorInfo', 1);
    form.append('billAmount', parseFloat(amount) * 100); // RM -> sen
    form.append('billEmail', buyer_email);
    form.append('billReturnUrl', 'https://yourdomain.com/success');
    form.append('billCallbackUrl', 'https://yourdomain.com/callback');
    form.append('billTo', buyer_name);

    const response = await axios.post(TOYYIBPAY_API, form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const billCode = response.data[0]?.BillCode;
    if (!billCode) throw new Error('BillCode not returned');

    const payment_url = `https://dev.toyyibpay.com/${billCode}`;
    res.json({ payment_url });

  } catch (error) {
    console.error('Checkout error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(500).json({ error: 'Checkout failed.' });
  }
});

// Root
app.get('/', (req, res) => {
  res.send('Toyyibpay backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
