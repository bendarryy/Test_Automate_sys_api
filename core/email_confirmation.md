# Email Confirmation Flow for Registration

## Overview
After a user registers, they must confirm their email before being fully activated. The backend now requires email confirmation for new accounts. This document explains what the frontend should do to support this flow.

---

## Registration API (`/api/core/register/`)
- **Request:**
  - POST with user data (username, email, password, etc.)
- **Response (Success):**
  ```json
  {
    "message": "User created successfully. Please check your email to confirm your account.",
    "user_id": 123,
    "temp_session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
  ```
- **What to do:**
  - Show a message to the user: _"Registration successful! Please check your email to confirm your account before logging in."_
  - **Do NOT log the user in automatically.**
  - Optionally, store the `temp_session_id` if you want to support pre-login flows.

---

## Email Confirmation
- The user will receive an email with a link like:
  - `http://localhost:8000/api/core/confirm-email/<token>/` (or your frontend URL if configured)
- When the user clicks the link, their email is confirmed.
- **Frontend should:**
  - Optionally, provide a page that explains "Your email is being confirmed..." and call the confirm endpoint.
  - Show a success or error message based on the API response.

---

## Login (Owner Login/Token Endpoint)
- **Only allow login if the user's email is confirmed.**
- If a user tries to log in (get a token) and their email is not confirmed, the backend will return:
  ```json
  {
    "error": "Please confirm your email before logging in."
  }
  ```
  with a 403 Forbidden status.
- **Frontend message:**
  - Show: _"Please confirm your email before logging in. Check your inbox for the confirmation link."_
- (Backend enforcement is now active for security.)

---

## Edge Cases & All Possible Scenarios

### Registration
- **Username or email already exists:**
  - Backend returns a 400 with error details.
  - **Frontend message:** "This username or email is already in use. Please try another."
- **Invalid email format or weak password:**
  - Backend returns a 400 with error details.
  - **Frontend message:** "Please enter a valid email and a strong password."
- **Email delivery fails (rare):**
  - Backend uses `fail_silently=True`, so user may not know. Consider adding a resend option or support contact.
  - **Frontend message:** "If you do not receive a confirmation email, please check your spam folder or contact support."

### Email Confirmation
- **Token is valid and unused:**
  - Backend returns 200, email is confirmed.
  - **Frontend message:** "Email confirmed! You can now log in."
- **Token is invalid or expired:**
  - Backend returns 400 with `{ "error": "Invalid or expired token." }`
  - **Frontend message:** "This confirmation link is invalid or has already been used. Please request a new confirmation email or contact support."
- **User tries to confirm again after already confirmed:**
  - Backend returns 400 (same as above).
  - **Frontend message:** "Your email is already confirmed. You can log in."

### Login
- **User tries to log in before confirming email:**
  - Backend returns 403 with `{ "error": "Please confirm your email before logging in." }`
  - **Frontend message:** "Please confirm your email before logging in. Check your inbox for the confirmation link."
- **User tries to log in with wrong password:**
  - Backend returns 401 with "Invalid Username or Password".
  - **Frontend message:** "Invalid username or password. Please try again."
- **User tries to log in with unregistered email:**
  - Backend returns 401 with "No active account found with the given credentials" or similar.
  - **Frontend message:** "No account found with this email. Please register first."

### Resending Confirmation Email
- **User did not receive the confirmation email:**
  - (If implemented) Provide a "Resend confirmation email" option.
  - **Frontend message:** "Didn't receive the email? [Resend confirmation email] or contact support."

### Other
- **User tries to register with an email that is not confirmed yet:**
  - Backend may allow or block; if blocked, return a message.
  - **Frontend message:** "An account with this email exists but is not confirmed. Please check your email or request a new confirmation link."

---

## Summary of Required Frontend Changes
1. **After registration:**
    - Show a message to check email for confirmation.
    - Do not auto-login.
2. **After email confirmation:**
    - Show a success message and allow login.
3. **On login attempt before confirmation:**
    - Show a message: "Please confirm your email before logging in."
4. **Handle all error messages and edge cases above.**
5. **For owner login/token endpoint:**
    - If you receive a 403 with `{"error": "Please confirm your email before logging in."}`, show the appropriate message and do not proceed to the app.

---

## Example User Flow
1. User registers.
2. User sees: _"Please check your email to confirm your account."_
3. User clicks the link in their email.
4. User sees: _"Email confirmed! You can now log in."_
5. User logs in and accesses the app.

---

## Notes
- The confirmation email is sent from the backend. If you do not receive it, check your spam folder or backend email settings.
- The confirmation link expires when used (one-time use).
- If you need to resend the confirmation email, contact support or implement a resend endpoint. 