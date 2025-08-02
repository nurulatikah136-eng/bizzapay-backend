const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ENV Variables
const BIZZAPAY_API_KEY = process.env.BIZZAPAY_API_KEY;
const CATEGORY_CODE = process.env.CATEGORY_CODE;
const BIZZAPAY_ENDPOINT = 'https://api.bizzapay.my/v1/checkout';

// Routes
app.post('/checkout', async (req, res) => {
  try {
    const { buyer_name, buyer_email, amount, reference } = req.body;

    const payload = {
      category_code: CATEGORY_CODE,
      amount,
      reference,
      buyer_name,
      buyer_email,
      callback_url: 'https://yourdomain.com/callback',
      redirect_url: 'https://yourdomain.com/success'
    };

    const response = await axios.post(BIZZAPAY_ENDPOINT, payload, {
      headers: {
        Authorization: `Bearer ${BIZZAPAY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ payment_url: response.data.payment_url });
  } catch (error) {
    console.error('Checkout error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    res.status(500).json({ error: 'Checkout failed.' });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Bizzapay backend is running.');
});

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
