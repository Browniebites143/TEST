# Brownie Bite — Orders + Admin (Firebase Realtime DB)

This is a lightweight storefront for **Brownie Bite** with UPI deep links and a simple admin panel.

## Features

- Brand font: **Ravie**-style (system fallback included)
- Auto **Order ID** generation (e.g., `BB-20250824-1234`)
- **Auto total** calculation by product × quantity
- Payment options:
  - **GPay**, **PhonePe**, **Paytm**, **FamPay** (UPI deep links with amount & order ID prefilled)
  - **COD** (Cash on Delivery)
- **Track Order** by ID (shows order status + payment status)
- Admin panel
  - Login via **username + pin** (front-end only)
  - View all orders in a table
  - Update **Order Status** (Pending, Preparing, Prepared, Out for Delivery, Delivered, Cancelled)
  - Update **Payment Status** (Pending (COD), Pending (UPI), Paid)
  - **Delete** orders
  - **Logout** button
- Thank You page showing the **Order ID**

## Files

- `index.html` — Customer order page
- `thankyou.html` — Success page
- `login.html` — Admin login
- `admin.html` — Admin table
- `style.css` — Styling
- `firebaseConfig.js` — Your Firebase configuration
- `script.js` — Customer side logic
- `admin.js` — Admin side logic

## Firebase Setup

1. Realtime Database → Create database → start in **Locked mode**.
2. Rules (for quick demo; restrict later):
   ```json
   {
     "rules": {
       "orders": { ".read": true, ".write": true }
     }
   }
   ```
3. Copy your web config into `firebaseConfig.js` (already added here).

> ⚠️ Security: These rules are **open** so the site works without auth. Before going live, add auth or server-side validation and restrict rules appropriately.

## UPI Notes

- We construct links like:
  ```
  upi://pay?pa=9380248566@fam&pn=Brownie%20Bite&am=123&cu=INR&tn=Order%20BB-...&tr=BB-...
  ```
- iOS handling of custom schemes varies by browser. We also provide per‑app schemes (tez://, phonepe://, paytmmp://) and fallback to `upi://pay`.
- After attempting to open the app, we redirect to `thankyou.html?orderId=...` as a fallback.

## Admin Login

- **Username:** `BROWNIE BITES`
- **Pin:** `BROWNIEbites@463235_6432`

You can change them inside `login.html`.

## Deploy

- GitHub Pages: push files to your repo root (or `/docs`) and enable Pages.
- Verify that `index.html`, `firebaseConfig.js`, `script.js` load over HTTPS.

Enjoy! 🍫
