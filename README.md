Styla App README


Setup:

- create necessary project resources on Firebase, Google Cloud Console, EAS
- input environment variables into app.json and .env where required (use .env-example to create the .env file)
- run commands _npm install_ and _firebase deploy_
- launch locally with _npx expo start_ and deploy with _eas build_


Codebase Notes:

_Authorization_
- Google requires Oauth redirect URI's to have http in front. To counteract this when testing locally, I prepend redirectmeto.com in front of the redirect URI. If working in a deployed environment, this can be removed without harm.

_Admin Panel_
- this panel can be accessed by logging in to a Google account and pressing the new button on the navbar after login.
- hosts profile editing resources that are not currently wired into the app. Select the user from a list of all users you want to edit, and page will load as if you are that user to make changes.

_Firestore Database_
- users are currently added manually to the database, there is no method for adding new owners in the current code
- resources exist to edit a profile once it is created in Admin Panel

_Map Features_
- Owner Markers are currently buggy and will lose positioning or disappear from screen during normal usage. This section has lots of branching logic and checks that can be removed once a clean implementation of markers has been achieved.

_Social Feed/Landing Page_
- currently not wired to socials, have placeholder gray boxes instead of media
- needs connection to Instagram and Tiktok, social media algorithm to present posts in order unique to each user, and post analytics tracking

_Top 5 System_
- intended for both owners and users, but currently only implemented for owners. Users have a frontend placeholder in LandingPage, but no infrastructure to support this yet.
