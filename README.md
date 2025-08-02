# Bizzapay Backend (Express.js)

This is a simple Express.js backend for generating Bizzapay FPX payment URLs using their API.

## 🚀 How to Use

1. Clone or upload this repo to your GitHub account.
2. Deploy it to [Render.com](https://render.com) as a **Web Service**.
3. Use the `/checkout` endpoint to generate payment links.

## 📦 Setup

### Install dependencies
```bash
npm install
```

### Start server
```bash
npm start
```

## 📡 POST /checkout

**Endpoint:** `/checkout`  
**Method:** `POST`  
**Content-Type:** `application/json`

### Body Parameters:
```json
{
  "buyer_name": "Ali",
  "buyer_email": "ali@example.com",
  "amount": 180,
  "reference": "INV-123"
}
```

### Response:
```json
{
  "payment_url": "https://bizzapay.link/your-payment-url"
}
```

## ⚙️ Customize
Update `server.js` to change:
- Your API key
- Category code
- Redirect and callback URLs

---

Made for Bizzapay integration.
