To run the React server   navigate to /frontend then  `npm run dev`

## Authentication
The application uses cookie-based authentication with Django's CSRF token. The frontend checks for the presence of the `csrftoken` cookie to determine if a user is authenticated. This provides a secure way to maintain user sessions and protect against CSRF attacks.

When Getting error having pull and push at same time usre this `git pull --rebase origin dev`

## add side bar 
it is under development 

## i am comment the cookies settings
 SESSION_COOKIE_SAMESITE = 'None'
 SESSION_COOKIE_SECURE = True
 CSRF_COOKIE_SAMESITE = 'None'
 CSRF_COOKIE_SECURE = True

