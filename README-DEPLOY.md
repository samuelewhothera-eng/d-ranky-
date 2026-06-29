# D-RANKY — Deploy Tonight Guide

## What's been done
- Frontend fully connected to backend (auth, products, Paystack checkout, payment verification)
- Backend hardened (CORS, rate limiting, helmet, Paystack webhook)
- Products seed script ready
- One change needed before going live (see Step 1)

---

## STEP 1 — Update the API URL in index.html

Open `index.html` and find this line near the top of the `<script>` block:

```js
const API = 'https://your-backend-url.com/api';
```

Replace with your actual deployed backend URL. E.g.:
```js
const API = 'https://d-ranky-backend.onrender.com/api';
```

---

## STEP 2 — Deploy the Backend (Render — free)

1. Go to https://render.com → New → **Web Service**
2. Connect your GitHub repo (push the `backend/` folder or the whole project)
3. Set:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add **Environment Variables** (copy from `backend/.env.example`):

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string (run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| `PAYSTACK_SECRET_KEY` | Your live key from https://dashboard.paystack.com/#/settings/developers |
| `FRONTEND_URL` | Your frontend URL e.g. `https://d-ranky.netlify.app` |
| `PAYSTACK_CALLBACK_URL` | `https://d-ranky.netlify.app/payment/verify` |
| `PORT` | `5000` |

5. Deploy. Copy the backend URL (e.g. `https://d-ranky-backend.onrender.com`)

---

## STEP 3 — Set up MongoDB Atlas (free)

1. Go to https://mongodb.com/atlas → create free cluster
2. Create a database user with a password
3. Whitelist all IPs: `0.0.0.0/0` (Network Access)
4. Get connection string → paste as `MONGODB_URI` in Render

---

## STEP 4 — Seed admin + products

After backend is live, run these once from your local machine:

```bash
cd backend
cp .env.example .env
# Fill in your .env values, then:

npm install
ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=YourStrongPass npm run seed:admin
npm run seed:products
```

Or you can set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your Render environment variables and run `npm run seed:admin` via Render's Shell tab.

---

## STEP 5 — Deploy Frontend (Netlify — free)

1. Go to https://netlify.com → **Add new site → Deploy manually**
2. Drag and drop the `index.html` file (and any images/assets)
3. Done — you get a URL like `https://d-ranky.netlify.app`

Or connect GitHub for auto-deploy on every push.

---

## STEP 6 — Configure Paystack Callback

In your Paystack dashboard (https://dashboard.paystack.com):
- Go to **Settings → API Keys & Webhooks**
- Set **Callback URL** to: `https://your-frontend-url.com` (or leave as the frontend root — the `?reference=` param is appended automatically)
- Set **Webhook URL** to: `https://your-backend-url.com/api/webhook/paystack`

---

## STEP 7 — Test the full flow

1. Open your frontend URL
2. Click **Sign In** → Create an account
3. Open any collection → Add items to cart
4. Checkout → Enter address → Click **Proceed to Payment**
5. You'll be redirected to Paystack's hosted page
6. Complete payment (use test card `4084084084084081` CVV `408` Exp `05/31` if still on test key)
7. Paystack redirects back to your site → payment confirmation banner appears

---

## File structure

```
d-ranky/
├── index.html                        ← Frontend (deploy to Netlify)
└── backend/
    ├── package.json
    ├── .env.example                  ← Copy to .env, fill in values
    └── src/
        ├── server.js
        ├── app.js
        ├── config/db.js
        ├── controllers/
        │   ├── authController.js
        │   ├── productController.js
        │   └── orderController.js
        ├── middleware/auth.js
        ├── models/
        │   ├── User.js
        │   ├── Product.js
        │   └── Order.js
        ├── routes/
        │   ├── authRoutes.js
        │   ├── productRoutes.js
        │   ├── orderRoutes.js
        │   └── webhookRoutes.js
        ├── services/paystackService.js
        ├── utils/tracking.js
        └── scripts/
            ├── seedAdmin.js
            └── seedProducts.js       ← Seeds 18 products matching the site
```

---

## Support

Email: samuelewhothera@gmail.com  
WhatsApp: +234 816 814 7520
