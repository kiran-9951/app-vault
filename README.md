🧩 Tech Stack:
Backend: Node.js, Express.js (RESTful API architecture)
Database: MongoDB with Mongoose ODM
Authentication: JWT-based (Access + Refresh Tokens), bcrypt for password hashing
File Storage: Cloudinary (secure file handling with public_id and secure URLs)
Email Service: Nodemailer (for OTPs and notification emails)
Security: CORS, Helmet, Rate Limiting, Input Validation (express-validator), role-based access control

⚙️ Core Features:
🔐 User Authentication & Authorization:
Registration with OTP Verification:
Users register with basic info and receive an OTP via email (expires in 5 minutes).
OTP verified before account is activated.
Optional profile image upload during registration.

Login with JWT & OTP:
Credentials validated, then OTP sent for second-layer verification.
On successful login, access and refresh tokens are issued.

Access & Refresh Token System:
Access token used for user operations (short expiry).
Refresh token used to regenerate access token via /refresh-token endpoint.
Tokens securely stored and validated.

Logout:
On logout, refresh token is invalidated/removed from DB (token blacklist or token versioning).

Password Management:
Forgot Password: User submits email → receives OTP → verifies OTP → sets new password.
Update Password: Logged-in users can change password securely.

Authorization Middleware:
Middleware checks for valid token, role, and permissions before accessing protected routes.

📦 Asset Management:
Users can:
Upload images/files to Cloudinary.
View all uploaded assets.
Delete any of their own assets.
Cloudinary returns a secure_url and public_id, stored in MongoDB.
File type and size validated on upload.

🧑‍💼 Admin Capabilities:
Admin-only protected routes allow:
Viewing all registered users with pagination support.
Viewing and managing all assets.
Deleting any user or user-uploaded content.

🔒 Security Features:
Passwords hashed using bcrypt with salt rounds.
JWT secrets and token expirations are managed via environment variables.
OTPs expire after 5 minutes to prevent abuse.
Rate limiting on OTP resend and login attempts to mitigate brute-force attacks.
Role-based access control ensures separation of user/admin privileges.

📧 Email Services:
Emails are sent for:
Registration OTP verification
Forgot password OTP
Login success notifications
Implemented with Nodemailer using SMTP or Gmail OAuth2

☁️ File Uploads:
Files are uploaded to Cloudinary via signed API requests.
Upon success:
The secure image URL is saved in the database.
Each file is tied to the user's ID.
Admin can bulk delete or access assets.

✅ Summary:
This backend provides a secure, scalable authentication system with robust asset management and admin-level control, ideal for production environments involving user-generated content, such as vaults, portfolios, or dashboards.
