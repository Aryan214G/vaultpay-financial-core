# VaultPay Financial Core — Prompts

1. scaffold a next.js project called vaultpay-financial-core with tailwind, set up the base layout with geist font and dark mode ready

2. can we make the first vaultpay dashboard screen? want a clean corporate finance look with a sidebar, invoice summary cards and a recent invoices table. use sample data for now, no auth or stripe yet
3. lets separate the admin and client dashboard views so we can work on them independently. add a temporary role dropdown to preview both screens for now, we'll replace it with proper authentication later

4. set up firebase in the next app using the npm sdk and env vars. we only need email/password auth for now so keep the config simple, no analytics or other firebase services yet

8. the profile lookup is failing but the terminal doesnt show the firebase error. can we log the actual error code and message in AuthGate so we can debug the real cause instead of guessing

47. AuthGate already fetches the users firestore doc but only saves the role. Can we keep the profile data too and pass it into the admin dashboard so the name, initials and role label come from the actual profile instead of placeholders?

54. create a separate firebase-admin module for server routes using service account credentials from env vars. keep the private key server-only and dont change the existing client firebase.js

55. add a reusable require-auth helper that verifies the bearer firebase token on the server and gets the role from the users document. return 401 for bad tokens and 403 for missing or invalid profiles

56. add a GET /api/auth/me route using require-auth so we can test the server authentication before building invoice endpoints. only return the verified uid, email and role, not the whole profile

59. authform only saves email and role right now. add a full name field for registration and save the trimmed name in the users doc, but keep new accounts locked to the client role. we'll fix the firestore rules before testing signup
