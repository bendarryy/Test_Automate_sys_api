To run the React server   navigate to /frontend then  `npm run dev`

## Authentication
The application uses cookie-based authentication with Django's CSRF token. The frontend checks for the presence of the `csrftoken` cookie to determine if a user is authenticated. This provides a secure way to maintain user sessions and protect against CSRF attacks.
