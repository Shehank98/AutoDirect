# Email with Google Apps Script

The website sends each event to a small Google Apps Script. The script sends the emails from your Google account.

| When | Who gets an email |
|---|---|
| A quote, viewing, contact or "sell my car" message | The team, and a receipt to the customer (if they gave an email) |
| An auction request | The team, and a receipt to the customer (if they gave an email) |
| A newsletter sign-up | The team |
| Someone creates an account | The customer gets a "Confirm your email" link from **your** address |
| Someone taps "Forgot password" | The customer gets a "Reset your password" link from **your** address |
| You change the order stage in Admin (Bidding, Won, LC opened, Shipped, Arrived, Delivered) | The customer (if the request has an email) |

## 1. Create the script
1. Sign in to the Google account that should send the emails (for example `alerts@yourdomain.lk` or your Gmail).
2. Open <https://script.google.com> and choose **New project**. Name it `Direct Auto mail`.
3. Delete the sample code, paste in everything from `Code.gs`, and click **Save**.

## 2. Add two secrets
1. Click the gear icon (**Project settings**). Under **Script properties**, choose **Add script property**:
   - `SECRET`: a long random text, 20 characters or more. Keep a copy.
   - `ADMIN_EMAILS`: who receives the team emails, comma separated. Example: `owner@gmail.com, sales@yourdomain.lk`.

## 3. Publish it as a web app
1. Click **Deploy > New deployment**. Click the gear next to "Select type" and choose **Web app**.
2. Set **Execute as: Me** and **Who has access: Anyone**. ("Anyone" is needed so the server can call it. The `SECRET` stops everyone else.)
3. Click **Deploy**, then **Authorize access**. Choose your account. If Google warns "this app isn't verified", click **Advanced > Go to Direct Auto mail (unsafe)** and **Allow**. It is your own script sending your own mail.
4. Copy the **Web app URL** (it ends in `/exec`).

## 4. Tell the server
In your host's Variables (Railway) add:

```
APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec
APPS_SCRIPT_SECRET=<the same text as SECRET>
SITE_URL=https://your-website-address
```

Redeploy. Open **Admin > Inquiries** and press **Send test email**. The team address should receive "Direct Auto email test".

## Account emails (confirm email and reset password)
Firebase's own emails come from a generic `firebaseapp.com` address, and Gmail often files them under spam. With this script connected, the website asks Firebase for the secure link and sends the email itself, from your address, with a link on your own website (`/auth-action`).

- Set `SITE_URL` to your real website address (for example `https://www.directautoimport.lk`) so the link shows your own domain.
- Add that domain under Firebase **Authentication > Settings > Authorized domains**.
- These two emails are always sent, even if you switch off "Emails to customers".
- If the script is not connected or fails, the website quietly falls back to Firebase's own email, so sign-up and password reset never stop working.

## Making the emails land in the inbox
- **Best:** send from a Google Workspace address on your own domain (for example `alerts@directautoimport.lk`). Google signs the mail for your domain automatically. Plain Gmail also works well.
- Keep the wording plain. The templates already avoid shouting, discount words and image-only layouts.
- The very first email to a new address can still be doubted by Gmail. If a customer reports it in spam, ask them to press **Not spam** once, and later emails go to the inbox.

## Good to know
- **Changing the script later:** paste the new code over the old, **Save**, then click **Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy**. The URL stays the same. Forgetting the *New version* step is the usual reason a change does not take effect.
- **Limits:** a free Gmail account can send about 100 emails a day, Google Workspace about 1,500. That is plenty for inquiries.
- **Who the email comes from:** the Google account that owns the script. Replies to a customer's email go to the customer when you reply to the team email (the Reply-To is set to them).
- **Customer emails off:** in **Admin > Site details > Emails to customers** you can switch off receipts and order-stage emails. Team emails always go out.
- **Nothing arrives?** Check spam. In the script, open **Executions** to see errors. A "Wrong secret" error means `SECRET` and `APPS_SCRIPT_SECRET` differ.

## Backup emails

The same script also sends the website backup (Admin › Backup & restore › Automatic backup by email) as a file attachment.
After updating `Code.gs`, paste the new code and choose **Deploy › Manage deployments › Edit › New version**, so the `backup` event works.
