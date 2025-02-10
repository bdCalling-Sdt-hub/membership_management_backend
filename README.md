# Avantra

Avantra is a membership management app

## Tech Stack

Node, Express, MongoDB, Cloudinary, Socket.IO, Stripe

## Documentation

[Postman](https://spark-tech-1674.postman.co/workspace/Spark-Tech-Workspace~3dc67139-acf2-4e3c-bea2-20bc71e1fb41/collection/41742263-78841f1a-37b3-493e-a2fc-a1c85c637a80?action=share&creator=41742263)

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

#### Server

`PORT`

#### Auth

`ACCESS_TOKEN_SECRET`
`REFRESH_TOKEN_SECRET`
`PASSWORD_RESET_SECRET`

#### Bcrypt

`SALT_ROUNDS`

#### Database

`MONGO_URI`

#### Nodemailer

`EMAIL_USER`
`EMAIL_PASS`

#### Cloudinary

`CLOUDINARY_CLOUD_NAME`
`CLOUDINARY_API_KEY`
`CLOUDINARY_API_SECRET`

#### Stripe

`STRIPE_PUBLISHABLE_KEY`
`STRIPE_SECRET_KEY`
`STRIPE_WEBHOOK_SECRET`

## Deployment

To run this project

```bash
  npm run dev
```

To build and deploy this project

```bash
  npm run build && npm run start
```

## Roadmap

Todos:
- Earnings list
- Update stripeOnboardingDone
- Tools Category: Add Image/Icon upload option
- Admin Dashboard
- Terms & Conditions and Privacy Policy APIs

Bug:
- tools/upload. after file upload, the secure url doesn't work

Clean Up:
- Remove otp from responses. src/controllers/user.ts

Improvements:
- Instead of keep creating OTPs untill we finally save a unique OTP, we can save it like this format: "user@email.com:615243"

Do Later:
- Test Stripe Connect Transfers

## Authors

- [@safin-sys](https://www.github.com/safin-sys)
