# ShopNest

ShopNest is a full-stack MERN e-commerce application for browsing products, placing orders, making payments, and managing an online store.

## Features

- Product listing and product details
- User registration with email OTP verification
- JWT-based login and authentication
- Shopping cart with Redux Toolkit
- Checkout and Razorpay payment integration
- User profiles and order history
- Product reviews for delivered orders
- Admin dashboard with:
  - Sales and user statistics
  - Product management
  - Order management
  - User directory
- Cloudinary support for product image uploads

## Technology

- **Frontend:** React, React Router, Redux Toolkit, Context API
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JSON Web Tokens and bcryptjs
- **Integrations:** Razorpay, Cloudinary, Nodemailer

## Project Structure

```text
ShopNest - Ecom MERN/
├── backend/       # Express API, database models, routes, and services
├── frontend/      # React application
├── package.json   # Root development scripts
└── README.md
```

## Prerequisites

Install the following before starting:

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB Atlas database
- Razorpay account for payment testing
- Cloudinary account for image uploads
- Gmail or another SMTP account for OTP emails

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd "ShopNest - Ecom MERN"

cd backend
npm install
copy .env.example .env

cd ../frontend
npm install
```

On macOS/Linux, use `cp .env.example .env` instead of `copy .env.example .env`.

## Environment Variables

Open `backend/.env` and update the values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopnest
JWT_SECRET=replace_with_a_long_random_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_email_app_password

FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Keep `.env` private. Never commit passwords, API keys, or database credentials.

## Run the Application

### Run both applications together

From the project root:

```bash
npm run dev
```

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### Run applications separately

In terminal 1:

```bash
cd backend
npm run dev
```

In terminal 2:

```bash
cd frontend
npm start
```

The frontend automatically proxies `/api` requests to the backend.

## Seed Development Data

The seed command creates sample products and an admin account. Use it only with a development database because it removes existing seeded users and products.

```bash
cd backend
npm run seed
```

Default admin account:

```text
Email:    admin@shopnest.com
Password: password123
```

Change this password before using the application outside local development.

## API Routes

All API routes are served by the backend at `http://localhost:5000`.

| Area | Base route | Purpose |
| --- | --- | --- |
| Authentication | `/api/auth` | Register, verify OTP, login, and users |
| Products | `/api/products` | Browse and manage products |
| Orders | `/api/orders` | Create, view, and update orders |
| Reviews | `/api/reviews` | View and submit product reviews |
| Payments | `/api/payment` | Create and verify Razorpay payments |
| Analytics | `/api/analytics` | Admin dashboard statistics |

Protected requests must include:

```http
Authorization: Bearer <jwt-token>
```

## Useful Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start frontend and backend together |
| `npm run build` | Create a frontend production build |
| `npm run dev-server` | Start the backend with Nodemon |
| `npm run dev-client` | Start the React development server |
| `cd backend && npm start` | Start the backend normally |
| `cd backend && npm run seed` | Load development data |
| `cd frontend && npm test` | Run frontend tests |

## Troubleshooting

### Frontend cannot connect to the backend

1. Confirm the backend is running on port `5000`.
2. Check that `frontend/package.json` uses `http://localhost:5000` as its proxy.
3. Confirm `MONGO_URI` is valid and MongoDB is running.

### OTP emails are not sent

- Check `GMAIL_USER` and `GMAIL_PASS`.
- Use a Gmail app password.
- Confirm the email account allows SMTP access.

### Authentication errors after logout

Clear the saved session in the browser and reload:

```js
localStorage.removeItem('userInfo');
```

Then log in again.

## Security

- Use strong, unique secrets in production.
- Use Razorpay test credentials during development.
- Do not expose `.env` files.
- Do not run the seed command against a production database.
