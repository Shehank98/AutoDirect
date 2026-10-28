# Firebase setup (admin sign-in, customer accounts, photo upload)

You need one Firebase project. It gives you: sign-in for the admin and for customers, and Storage for car photos.

## 1. Create the project
1. Open <https://console.firebase.google.com> and choose **Create a project**. Name it `direct-auto`.
2. Google Analytics is optional. You can switch it off.

## 2. Turn on sign-in
1. **Build > Authentication > Get started**.
2. Open **Sign-in method**, choose **Email/Password**, switch on the first option (leave "Email link" off), **Save**.
3. Open **Settings > Authorized domains** and **Add domain** for your website: the Railway domain (`something.up.railway.app`) and your own domain (`directautoimport.lk`). Without this, sign-in fails with `auth/unauthorized-domain`.

## 3. Get the web app settings
1. Click the gear > **Project settings > General**. Under **Your apps**, click the web icon `</>`, name it `website`, **Register app** (no hosting).
2. You will see `firebaseConfig`. Copy each value into the matching server variable:

| Firebase value | Server variable |
|---|---|
| `apiKey` | `FIREBASE_API_KEY` |
| `authDomain` | `FIREBASE_AUTH_DOMAIN` |
| `projectId` | `FIREBASE_PROJECT_ID` |
| `storageBucket` | `FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `FIREBASE_APP_ID` |

## 4. Turn on Storage (car photos)
1. **Build > Storage > Get started**. Choose **production mode** and a location close to you (for example `asia-south1` or `asia-southeast1`).
2. Google may ask you to upgrade to the **Blaze (pay as you go)** plan before Storage can be created. If so, upgrade and set a **budget alert** (Billing > Budgets) at a small amount. A car website stays well inside the free monthly allowance, but check the current pricing on the Firebase site.
3. Copy the bucket name shown at the top of the Storage page (for example `direct-auto.firebasestorage.app`, without `gs://`) into `FIREBASE_STORAGE_BUCKET`.
4. Leave the default **rules** as they are (deny all). The website uploads photos through the server, and visitors see them through secure links, so no public rules are needed.

## 5. Create the server key
1. **Project settings > Service accounts > Generate new private key**. A `.json` file downloads.
2. Put the whole JSON on **one line** and save it as the variable `FIREBASE_SERVICE_ACCOUNT`. Easiest: `node -e "console.log(JSON.stringify(require('./key.json')))"` and copy the output.
3. Keep the file private. Never commit it or send it in chat. Delete it from your computer once the variable is saved.

## 6. Set the admin
Add to the server variables:

```
ADMIN_EMAILS=owner@yourdomain.lk
SITE_URL=https://your-website-address
```

Redeploy. Then:
1. On the website press **Sign in** (top right), choose **Create account** with the `ADMIN_EMAILS` address.
2. Open the verification email Firebase sends (check spam) and tap the link.
3. Sign in again. You land in the admin, and an **Admin** button shows in the header from now on.
4. More staff: go to **Admin > Admins**, type their email and press **Add admin**. They sign in on the website with that email and verify it. You never need the Firebase console for this.

## 7. Try a photo upload
**Admin > Vehicles > Add vehicle > Photos > Upload photos.** The sample photos switch off by themselves once Storage is connected.

## If something fails
| What you see | What to check |
|---|---|
| "Sign-in isn't available yet" | `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID` and `FIREBASE_SERVICE_ACCOUNT` are all set, then redeploy |
| `auth/unauthorized-domain` | Add the website address under Authentication > Settings > Authorized domains |
| "No admin access yet" | The email is not in `ADMIN_EMAILS`, or it is not verified yet. Verify it and press **Check again** |
| "Firebase Storage is not configured" | `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_STORAGE_BUCKET` are set correctly |
| Upload says permission denied | The service account JSON belongs to a different project than the bucket |
| Signed in, but only a normal account | The email must be on the admin list (`ADMIN_EMAILS` or **Admin > Admins**) **and verified**. An account created by hand in the Firebase console is **not verified**: press **Send the email again** in the yellow bar at the top of the site, open the link, then press **Check again**. If the yellow bar does not appear either, look in the server logs for a line starting `[auth]` |
