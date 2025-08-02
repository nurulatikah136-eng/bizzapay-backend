const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ENV variables from Render
const TOYYIBPAY_CATEGORY_CODE = process.env.CATEGORY_CODE;
const TOYYIBPAY_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY;

// Toyyibpay endpoint (production)
const TOYYIBPAY_API = 'https://toyyibpay.com/index.php/api/createBill';

app.post('/checkout', async (req, res) => {
  try {
    const { buyer_name, buyer_email, amount, reference } = req.body;

    const form = new URLSearchParams();
    form.append('userSecretKey', TOYYIBPAY_SECRET_KEY);
    form.append('categoryCode', TOYYIBPAY_CATEGORY_CODE);
    form.append('billName', 'Order #' + reference);
    form.append('billDescription', 'Payment for Order #' + reference);
    form.append('billPriceSetting', 1);
    form.append('billPayorInfo', 1);
    form.append('billAmount', parseFloat(amount) * 100); // sen
    form.append('billEmail', buyer_email);
    form.append('billTo', buyer_name);
    form.append('billReturnUrl', 'https://yourdomain.com/success');
    form.append('billCallbackUrl', 'https://yourdomain.com/callback');

    const response = await axios.post(TOYYIBPAY_API, form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const billCode = response.data?.[0]?.BillCode;
    if (!billCode) throw new Error('No BillCode returned');

    const payment_url = `https://toyyibpay.com/${billCode}`;
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

// Health check route
app.get('/', (req, res) => {
  res.send('Toyyibpay backend is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
