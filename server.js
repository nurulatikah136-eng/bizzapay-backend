const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ENV Variables
const TOYYIBPAY_USER_SECRET_KEY = process.env.TOYYIBPAY_USER_SECRET_KEY; // contoh: s8h2u1s-xxxx-xxxx
const CATEGORY_CODE = process.env.CATEGORY_CODE; // contoh: abcd1234
const TOYYIBPAY_CREATE_BILL_URL = 'https://toyyibpay.com/index.php/api/createBill';

// Routes
app.post('/checkout', async (req, res) => {
  try {
    const { buyer_name, buyer_email, amount, reference } = req.body;

    const formData = new URLSearchParams();
    formData.append('userSecretKey', TOYYIBPAY_USER_SECRET_KEY);
    formData.append('categoryCode', CATEGORY_CODE);
    formData.append('billName', `Order #${reference}`);
    formData.append('billDescription', 'Payment for purchase');
    formData.append('billPriceSetting', 1);
    formData.append('billPayorInfo', 1);
    formData.append('billAmount', (parseFloat(amount) * 100).toString()); // toyyibpay expects amount in cents
    formData.append('billReturnUrl', 'https://yourdomain.com/success');
    formData.append('billCallbackUrl', 'https://yourdomain.com/callback');
    formData.append('billTo', buyer_name);
    formData.append('billEmail', buyer_email);
    formData.append('billPhone', '0123456789'); // Optional
    formData.append('billExternalReferenceNo', reference);
    formData.append('billSplitPayment', 0);
    formData.append('billPaymentChannel', 0);
    formData.append('billDisplayMerchant', 1);

    const response = await axios.post(TOYYIBPAY_CREATE_BILL_URL, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.data && response.data[0]?.BillCode) {
      const paymentUrl = `https://toyyibpay.com/${response.data[0].BillCode}`;
      return res.json({ payment_url: paymentUrl });
    } else {
      throw new Error('No BillCode returned');
    }
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
  res.send('ToyyibPay backend is running.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
