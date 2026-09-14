# Deploying DirectAuto Import to Railway

This is a legacy **PHP** app (Medoo 1.2 DB layer) that runs on **Apache + PHP 7.4**
and needs a **MySQL** database. Everything the app needs to run lives in this one
folder (`directauto/`).

---

## 1. Which database? → MySQL

Use a **MySQL** database (MySQL 8.0 or MariaDB — both work). The code is written
for MySQL (`'database_type' => 'mysql'` in every class in `system/classes/`), and
the data comes as MySQL dumps (`car_auction.sql`, `akila_car_auction.sql`).

> Do **not** use PostgreSQL — the app would need to be rewritten for it.

---

## 2. Create the services on Railway

1. **New Project → Deploy from GitHub repo**, pick this repo.
2. In the service **Settings → Build**, set **Root Directory** to `directauto`
   (so Railway builds from this folder). It will auto-detect the `Dockerfile`.
3. **New → Database → Add MySQL** in the same project.

---

## 3. Give the app the database credentials

The app reads its DB connection from environment variables (see `system/config.php`).
On the **app** service → **Variables**, add these as *reference variables* pointing
at the MySQL service:

| Variable        | Value (reference)              |
|-----------------|--------------------------------|
| `MYSQLHOST`     | `${{MySQL.MYSQLHOST}}`         |
| `MYSQLPORT`     | `${{MySQL.MYSQLPORT}}`         |
| `MYSQLUSER`     | `${{MySQL.MYSQLUSER}}`         |
| `MYSQLPASSWORD` | `${{MySQL.MYSQLPASSWORD}}`     |
| `MYSQLDATABASE` | `${{MySQL.MYSQLDATABASE}}`     |
| `SITE_URL`      | your public URL, e.g. `https://your-app.up.railway.app/` |

> Tip: use the **internal** host (`mysql.railway.internal`, port `3306`) — that's
> what the reference variables above resolve to, and it's free/fast. The connection
> code uses the default port `3306`, which matches the internal MySQL.

`PORT` is provided by Railway automatically — the container listens on it (handled
in `docker-entrypoint.sh`), so you don't set it yourself.

---

## 4. Import the database

The app expects the schema/data from the SQL dump. Import it **once** into the
Railway MySQL:

- Easiest: Railway MySQL service → **Data** tab → **Query**, or connect with the
  provided credentials using any MySQL client (TablePlus, DBeaver, `mysql` CLI),
  then run the contents of **`car_auction.sql`** (the newer dump).
- CLI example (using the public connection string from the MySQL service):
  ```bash
  mysql -h <PUBLIC_HOST> -P <PUBLIC_PORT> -u root -p <DATABASE> < car_auction.sql
  ```

---

## 5. Deploy

Push to the branch Railway is watching (or hit **Deploy**). Railway builds the
`Dockerfile` and starts Apache. Open the generated domain — the homepage
(`index.php`) should load.

---

## Notes & things to clean up (recommended, not required to boot)

- **Rotate the old DB password.** The previous `system/config.php` had a real
  production password committed. It's removed from the live code now, but it's
  still in git history — change that DB user's password.
- **`phpinfo.php`, `test.txt`, `error_log`** were removed from this folder (info
  disclosure / noise).
- **`timthumb.php`** is used for image thumbnails but is old and has a history of
  security issues. Consider replacing it later with server-side resizing.
- **File uploads** (`uploads/`) are written to the container's local disk, which is
  **ephemeral on Railway** — uploaded car images are lost on redeploy. For
  production, mount a Railway **Volume** at `uploads/` or move images to object
  storage (e.g. S3/Cloudflare R2).
- The **admin panel** lives at `/admin/`.
