# VaultPay Financial Core — Prompts

1. scaffold a next.js project called vaultpay-financial-core with tailwind, set up the base layout with geist font and dark mode ready

2. can we make the first vaultpay dashboard screen? want a clean corporate finance look with a sidebar, invoice summary cards and a recent invoices table. use sample data for now, no auth or stripe yet
3. lets separate the admin and client dashboard views so we can work on them independently. add a temporary role dropdown to preview both screens for now, we'll replace it with proper authentication later

4. set up firebase in the next app using the npm sdk and env vars. we only need email/password auth for now so keep the config simple, no analytics or other firebase services yet

5. can we add a simple login/register screen with firebase email password auth and keep track of whether someone is signed in. dont let registration ask for a role, we'll sort out admin vs client permissions separately

6. lets add firestore user profiles and give new accounts the client role by default. admin access should be provisioned separately and users shouldnt be able to make themselves admins

7. replace the temporary role dropdown with the role from firestore and add a sign out button. if the profile is missing or the role is invalid dont let the user into either dashboard, and make sure firestore rules stop users from changing their own role to admin

8. the profile lookup is failing but the terminal doesnt show the firebase error. can we log the actual error code and message in AuthGate so we can debug the real cause instead of guessing

47. AuthGate already fetches the users firestore doc but only saves the role. Can we keep the profile data too and pass it into the admin dashboard so the name, initials and role label come from the actual profile instead of placeholders?

54. create a separate firebase-admin module for server routes using service account credentials from env vars. keep the private key server-only and dont change the existing client firebase.js

55. add a reusable require-auth helper that verifies the bearer firebase token on the server and gets the role from the users document. return 401 for bad tokens and 403 for missing or invalid profiles

56. add a GET /api/auth/me route using require-auth so we can test the server authentication before building invoice endpoints. only return the verified uid, email and role, not the whole profile

59. authform only saves email and role right now. add a full name field for registration and save the trimmed name in the users doc, but keep new accounts locked to the client role. we'll fix the firestore rules before testing signup

66. add a read-only GET /api/invoices route using the existing requireAuth helper. admins can list all invoices, clients can only list invoices where clientId matches their firebase uid. use the firebase admin sdk, return json, handle errors, and don't add invoice creation or payment logic yet.

68. fix the invoices route build error caused by runtime = "nodejs" conflicting with cacheComponents. remove only the unnecessary runtime declaration, keep the auth and client ownership filtering intact, run eslint and retest the api.

69. debug the firebase admin "Failed to parse private key" error. inspect the env key format without printing secrets, verify newline handling and required markers, and fix the configuration without exposing credentials or changing invoice api behavior.

70. add a POST endpoint for invoice creation that only admins can use. validate the fields, make sure the selected user is a client, and set the invoice status to Pending on the server. keep the GET endpoint working too.

71. test invoice creation with the admin account using the protected POST endpoint. check the response and verify the invoice is saved in firestore before moving on to the client permission test.

74. test the clients api with both admin and client accounts. admin should get the client list with uid, name and email, while a client should get 403. dont change the dashboard yet.

76. prepare AdminDashboard to use react state and effects by adding the client directive and importing useEffect, useState and the firebase auth instance. leave the sample invoice data and ui unchanged for now.

77. connect AdminDashboard to the existing invoices api using the firebase id token. replace the sample invoices with fetched data and add loading, error and empty states. keep the existing layout and calculate the metrics from the real invoices.

78. use the admin-only clients api in AdminDashboard to map invoice clientIds to client names. keep email or uid as fallback and preserve the current table styling.

80. add state for the create invoice form, its submission status and feedback messages. make the existing create invoice button toggle between opening the form and cancel, without changing the current invoice fetching logic.
