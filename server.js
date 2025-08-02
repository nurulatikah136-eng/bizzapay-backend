const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const BIZZAPAY_API_KEY = process.env.BIZZAPAY_API_KEY;
const BIZZAPAY_ENDPOINT = 'https://api.bizzapay.my/v1/checkout';
const CATEGORY_CODE = process.env.CATEGORY_CODE;

app.get('/', (req, res) => {
  res.send('Hello from Bizzapay backend!');
});

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
    console.error('Checkout error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Checkout failed.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
