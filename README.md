# 🔧 FixMate — Home Service & Repair Booking Platform

**Find Trusted Technicians. Book Services. Get Things Fixed.**

FixMate is a full-stack home service and repair booking platform where customers can find services, book technicians, track repair requests, and make secure online payments. Technicians can manage their services and bookings, while administrators control service approvals, users, and platform activities.

---

## 🌐 Project Overview

FixMate connects customers with technicians through a simple and organized service-booking system.

The platform provides role-based dashboards for Customers, Technicians, and Administrators, making the complete repair service process easier to manage.

## ✨ Key Features

### 👤 Authentication & Authorization
- User registration and login using Better Auth.
- Role-based access control for Customer, Technician, and Admin.
- Secure session management and JWT-based API authorization.
- Protected routes and role-specific dashboards.

### 🛠️ Customer Features
- Browse admin-approved repair services.
- Search services by title or category.
- Filter services by category and service mode.
- Sort services by price and newest listings.
- View detailed service information.
- Submit repair requests with contact details, address, preferred date, and problem description.
- Cancel bookings while they are in the requested state.
- Track booking progress.
- Pay for completed services through Stripe Checkout.
- View payment history.

### 🔧 Technician Features
- Register and manage a technician account.
- Add new repair services with image uploads.
- Upload service images through ImgBB.
- Submit services for admin approval.
- Manage personal service listings.
- Receive and manage customer repair requests.
- Accept or reject bookings.
- Update booking progress:
  - Accepted
  - In Progress
  - Completed
- Set the final service amount upon completion.
- Manage bookings and service information.

### 🛡️ Admin Features
- Admin-only dashboard.
- Review pending service submissions.
- Approve or reject services.
- Manage user accounts and roles.
- Suspend or reactivate users.
- Monitor platform bookings.
- View payment transactions.

### 💳 Payment Integration
- Stripe Checkout integration.
- Secure server-side checkout session creation.
- Stripe webhook integration.
- Payment confirmation and booking status updates.
- Payment records stored in MongoDB.
- Success and cancellation pages.
- Test-mode payment support.

### 🖼️ Image Upload
- File-based service image selection.
- Image upload through the ImgBB API.
- Uploaded image URLs stored in MongoDB.
- API keys remain on the backend.

---

## 🔄 How the System Works

1. A user registers or logs in as a Customer or Technician.
2. A Technician creates a repair service and uploads an image.
3. The newly submitted service remains pending until an Admin approves it.
4. Customers browse approved services and submit repair requests.
5. Technicians accept or reject incoming bookings.
6. Accepted bookings move to In Progress.
7. Technicians complete the repair and provide the final amount.
8. Customers pay for completed services through Stripe Checkout.
9. Stripe confirms successful payments through webhooks.
10. Payment records and booking payment status are updated.

---

## 🧰 Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | Better Auth, JWT |
| Payment | Stripe Checkout, Stripe Webhooks |
| Image Hosting | ImgBB API |
| Development | VS Code, Git, GitHub |

---

## 📁 Project Structure

```text
FixMate/
│
├── fixmate-client/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   ├── customer/
│   │   │   └── technician/
│   │   ├── services/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
│
└── fixmate-server/
    ├── routes/
    ├── middleware/
    ├── scripts/
    ├── index.js
    └── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB Atlas account
- Stripe account
- ImgBB account

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd FixMate
```

### 2. Setup Backend

```bash
cd fixmate-server
npm install
```

Create a `.env` file inside the `fixmate-server` directory:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string

BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:8000

JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:3000

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

IMGBB_API_KEY=your_imgbb_api_key
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

Open another terminal:

```bash
cd fixmate-client
npm install
```

Create a `.env.local` file inside `fixmate-client`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 4. Stripe Webhook Setup

For local Stripe webhook testing, install and authenticate Stripe CLI.

Run:

```bash
stripe login
```

Then start the webhook listener:

```bash
stripe listen --events checkout.session.completed --forward-to localhost:8000/webhooks/stripe
```

Copy the generated webhook signing secret into the backend `.env` file as `STRIPE_WEBHOOK_SECRET`.

Keep the listener running during local payment testing.

---

## 💳 Stripe Test Payment

For testing payments in Stripe Test Mode, use the following test card:

| Field | Test Information |
|---|---|
| Card Number | 4242 4242 4242 4242 |
| Expiry Date | 12/34 |
| CVC | 123 |
| ZIP Code | Any valid test ZIP |

**Important:** Never use real card information or expose Stripe secret keys in frontend code or public repositories.

---

## 🔐 Environment Variables & Security

- Keep `.env` and `.env.local` files private.
- Never commit API keys, database credentials, or authentication secrets.
- Use backend environment variables for sensitive operations.
- Validate user roles and resource ownership on the server.
- Verify Stripe webhook signatures before processing payment events.
- Protect admin-only routes and operations.

---

## 🚀 Future Improvements

- Google Social Login with Better Auth.
- Technician Pro subscription plans.
- Customer ratings and reviews.
- Advanced technician verification.
- More detailed analytics and reporting.

---

## 👩‍💻 Developer

**Foyjun Nesa Afrin**

- GitHub: [@afrinnesa05-wq](https://github.com/afrinnesa05-wq)
- Project: FixMate

---

## 💡 Project Goal

FixMate aims to make home repair and maintenance services more accessible by connecting customers with technicians through a secure, transparent, and user-friendly digital platform.

**Built with dedication and a passion for learning full-stack web development.** 🔧