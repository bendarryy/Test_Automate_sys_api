# Applicatoin Logic 

### Order Status Flow 
✅ Kitchen Display System (KDS)
pending → Order created, waiting to be handled.
preparing → Chef is working on it.
ready → Chef has finished. Job done for kitchen here.

Summary : pending → preparing → ready

🍽️ In-House (Dine-In) Orders
ready (from kitchen) → seen by waiter.
served → Waiter delivered the food to the table.
completed → After customer finishes, pays, and leaves.

Summary : pending → preparing → ready → served → completed

🛵 Delivery Orders
ready (from kitchen) → seen by delivery guy or dispatch screen.
out_for_delivery → Delivery person took the order.
completed → Customer received And pay 

Summary : pending → preparing → ready → out_for_delivery → completed

![2025-05-09_15-36](https://github.com/user-attachments/assets/719f0f65-d436-49b1-ad88-b38224b8c401)

----
----
----

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

## if user is not authenticated redirect to login page
    i use the response status code 403 to check if the user is authenticated 




## inspect 
[`npm run dev`](http://localhost:5173/__inspect/)




