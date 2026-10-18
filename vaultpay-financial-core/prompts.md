# VaultPay Financial Core — Prompts

1. scaffold a next.js project called vaultpay-financial-core with tailwind, set up the base layout with geist font and dark mode ready

2. can we make the first vaultpay dashboard screen? want a clean corporate finance look with a sidebar, invoice summary cards and a recent invoices table. use sample data for now, no auth or stripe yet
3. lets separate the admin and client dashboard views so we can work on them independently. add a temporary role dropdown to preview both screens for now, we'll replace it with proper authentication later

4. set up firebase in the next app using the npm sdk and env vars. we only need email/password auth for now so keep the config simple, no analytics or other firebase services yet

5. can we add a simple login/register screen with firebase email password auth and keep track of whether someone is signed in. dont let registration ask for a role, we'll sort out admin vs client permissions separately
