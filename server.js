const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const TOYYIBPAY_CATEGORY_CODE = process.env.CATEGORY_CODE;
const TOYYIBPAY_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY;

app.post('/checkout', async (req, res) => {
  try {
    const { buyer_name, buyer_email, amount, reference } = req.body;

    const formData = new URLSearchParams();
    formData.append('userSecretKey', TOYYIBPAY_SECRET_KEY);
    formData.append('categoryCode', TOYYIBPAY_CATEGORY_CODE);
    formData.append('billName', reference || 'Payment');
    formData.append('billDescription', 'Online payment');
    formData.append('billPriceSetting', 1);
    formData.append('billPayorInfo', 1);
    formData.append('billAmount', amount * 100); // convert to cents
    formData.append('billReturnUrl', 'https://yourdomain.com/success');
    formData.append('billCallbackUrl', 'https://yourdomain.com/callback');
    formData.append('billTo', buyer_name);
    formData.append('billEmail', buyer_email);
    formData.append('billExternalReferenceNo', reference);

    const response = await axios.post(
      'https://toyyibpay.com/index.php/api/createBill',
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const billCode = response.data[0]?.BillCode;
    if (!billCode) {
      throw new Error('No BillCode returned');
    }

    const paymentUrl = `https://toyyibpay.com/${billCode}`;
    res.json({ payment_url: paymentUrl });
  } catch (error) {
    console.error('Checkout error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(500).json({ error: 'Checkout failed.' });
  }
});

app.get('/', (req, res) => {
  res.send('Toyyibpay backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
