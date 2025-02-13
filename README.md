# Avantra

Avantra is a powerful membership management application designed to streamline user interactions, notifications, and payments efficiently.

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js, MongoDB
- **Media Management:** Cloudinary
- **Real-Time Communication:** Socket.IO
- **Payments:** Stripe

## 📖 Documentation

Find the full API documentation here:  
[Postman Collection](https://spark-tech-1674.postman.co/workspace/Spark-Tech-Workspace~3dc67139-acf2-4e3c-bea2-20bc71e1fb41/collection/41742263-78841f1a-37b3-493e-a2fc-a1c85c637a80?action=share&creator=41742263)

## 🔑 Environment Variables

Ensure the following environment variables are set in your `.env` file before running the project:

### Server
- `BASE_URL`
- `PORT`

### Authentication
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `PASSWORD_RESET_SECRET`

### Security & Encryption
- `SALT_ROUNDS`

### Database
- `MONGO_URI`

### Email (Nodemailer)
- `EMAIL_USER`
- `EMAIL_PASS`

### Cloud Storage (Cloudinary)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Payments (Stripe)
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 🚀 Deployment

To run the project locally:

```bash
npm run dev
```

To build and deploy:

```bash
npm run build && npm run start
```

## 🔔 Notifications

The application leverages **Socket.IO** to deliver real-time notifications.

### ⚡ How It Works

- Each **user** is automatically joined to a room based on their `userId`.
- **Admins** belong to a global `"admin"` room for system-wide updates.

### 🎯 Frontend Integration

#### 📥 Listen for user notifications
```javascript
socket.on("new_notification", (data) => {
    console.log("User Notification:", data);
});
```

#### ⚙️ Listen for admin notifications
```javascript
socket.on("admin_notification", (data) => {
    console.log("Admin Notification:", data);
});
```

## 📌 Roadmap

### 🚀 Enhancements:
- Optimize OTP generation by storing it as `user@email.com:615243` to avoid redundant creation attempts.

### 🔬 Future Tests:
- Validate **Stripe Connect Transfers**

## 👥 Authors

- **[@safin-sys](https://www.github.com/safin-sys)**