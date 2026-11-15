# Apex Contour and Glow website: WordPress handover

This is the Apex Contour and Glow injectables site as a WordPress theme, in English with Thai to follow. It is written for whoever installs and runs the site. Please read it once before you start, and install on a staging copy first.

## Who does what

- **Apex's IT team** sets up the hosting, staging and live, and installs the site with the steps below. The server, the domain, SSL, email sending, backups and plugin updates are theirs to run.
- **Apex's staff** edit the content in WordPress: treatments, prices, before and after photos, the home page text, LINE and phone. Nothing in this list needs a developer.
- **Approvals** (the advertising approval from สบส., the legal review, signing off the Thai text) are Apex's. The site is handed over for Apex to check.
- **Gid** sends bigger changes, a new tool or a new page design, as a new theme zip. "Updating the theme" at the end says how to install one without losing anything.

## What is in this folder

| Path | What it is |
|---|---|
| `theme/apex-contour-glow/` | The theme. Every page of the site is drawn by it. |
| `theme/apex-contour-glow/inc/` | The PHP, one file per job. `functions.php` lists them. |
| `tools/export_content.py` | Packs the site's content into `theme/apex-contour-glow/import/content-en.json` for `wp apex import`, and the face planner data into `data/planner.json`. |
| `tools/build_theme.py` | Runs the export, copies the styles, scripts, fonts, images and 3D head into the theme, and builds `dist/apex-contour-glow-theme-<version>.zip`. |

Use the `apex-contour-glow-theme-<version>.zip` Gid sent, which already has everything.

## What the server needs

- WordPress 6.4 or newer. Tested on 6.8.3.
- PHP 8.0 or newer with the GD extension. Tested on PHP 8.3.
- MySQL 5.7+ or MariaDB 10.4+.
- HTTPS.
- WP-CLI for the content import. If the host has none, run the import on a local copy and move the database across.
- Outgoing email that works: WP Mail SMTP or the host's own mailer, since booking alerts go out with `wp_mail`.
- Two-step login for every Administrator and Apex staff account, since those accounts open booking requests with names and phone numbers: the Two Factor plugin or Wordfence Login Security.
- Polylang (the free plugin) 3.9 or newer.
- Rank Math (the free plugin), optional. The theme writes titles, descriptions, canonicals and structured data by itself. With Rank Math active, Rank Math prints them, and the theme fills any field an editor leaves empty there.
- A daily backup of the database and `wp-content/uploads/`. Keep 30 days.
- A page cache (the host's own, LiteSpeed Cache or WP Super Cache) with logged-in users and `/wp-json/` left out, which is the default in all of them.
- Gzip or Brotli on HTML, CSS, JavaScript and SVG, and a one-year browser cache on the theme's files.

## Install

1. Back up the live database and `wp-content/uploads/`.
2. Start from a clean WordPress install.
3. Install and activate Polylang: `wp plugin install polylang --activate`.
4. Upload the theme zip under Appearance › Themes, or copy `apex-contour-glow/` into `wp-content/themes/`, and activate it. The zip is about 8 MB.
5. Import the content: `wp apex import`. It also adds English and Thai to Polylang, with English at the root and Thai under `/th/`, sets post-name permalinks and the Bangkok time zone. It can be run again at any time: each item is found by its key and language and updated in place.
6. Check the import: `wp apex check`. It should end with `All 29 content objects match the package`.
7. Add these lines to `wp-config.php`:

   ```php
   define( 'DISALLOW_FILE_EDIT', true );
   // only when the site sits behind Cloudflare and cannot be reached any other way
   define( 'APEX_IP_HEADER', 'HTTP_CF_CONNECTING_IP' );
   // the daily job (deleting old booking requests) runs from the server's clock rather than on visits
   define( 'DISABLE_WP_CRON', true );
   ```

   With `DISABLE_WP_CRON`, add a cron job that runs every 15 minutes: `wp cron event run --due-now --path=/path/to/wordpress`.

   Optional, once every address of the site works over HTTPS. Browsers remember it, so start with a day and raise it to a year after a week:

   ```php
   define( 'APEX_HSTS', 86400 );
   ```

8. On nginx, add these rules. Apache needs nothing.

   ```nginx
   location ~* /wp-content/uploads/.*\.php$ { deny all; }
   location = /xmlrpc.php { deny all; }
   location ~* ^/(readme\.html|license\.txt)$ { deny all; }
   ```

   Set `expose_php = Off` in `php.ini`. Check compression and caching with `curl -sI -H "Accept-Encoding: gzip" https://<site>/wp-content/themes/apex-contour-glow/assets/css/lux.css`: it should show `Content-Encoding: gzip` (or `br`) and a long `max-age`.

9. Fill in the admin:
    - **Enquiries › Settings:** the email addresses that get booking alerts. Empty sends them to the WordPress admin address.
    - **Apex settings › Tracking and code:** the Google Tag Manager container. It is empty, so tracking is off until Apex adds one.
    - **Apex settings › Site settings:** check LINE and the phone number, and add the สบส. advertising permit number once Apex has it. It shows in the footer.
10. Create the staff accounts (see Who can see what).

Leave Polylang's URL settings as the import set them, since the addresses below depend on them.

## Addresses

English is at the root and Thai is under `/th/`.

| Page | English | Thai |
|---|---|---|
| Home | `/` | `/th/` |
| One treatment | `/treatments/botox/` | `/th/treatments/botox/` |
| Compare | `/compare/` | `/th/compare/` |
| Privacy policy | `/privacy/` | `/th/privacy/` |

The preview site's addresses (`botox.html`, `compare.html?a=botox&b=filler`) forward to these with a 301, so links shared during the review still work.

## What editors can change

- **Treatments:** each treatment page, from the opening paragraphs and facts box to prices, packages, areas, the visit steps, the results timeline, care, questions and sources. Its Summary feeds the home page price list, Compare and the face planner cards. Its Face areas decide which face planner areas show it.
- **Before and after:** one entry per case, linked to its treatment, with a before and an after photo. A photo grid case has only the after photo. The treatment's own "Before and after" box says whether its cases show in the gold mirror with a line to drag or as a photo grid.
- **Apex settings:**
  - Site settings: the site name, clinic line, LINE ID, phone, permit number and footer note.
  - Home page: the headings and text of every part of the home page, which treatment fills the before and after mirror, and the booking form wording.
  - Compare: the row names and the "Often compared" pairs with their notes.
  - Face planner: the names on the area buttons. Where each area sits on the 3D face is set by the research behind it (the MD Codes and published Botox injection guides), so it is not editable.
  - Privacy policy: the policy text, block by block. Apex's DPO should approve any change.
- Uploads are saved as WebP at quality 82, which loads faster. Settings › Media turns this off.

Each item has a Languages box. The Thai copy of a treatment is made from the + beside the Thai flag, and each Apex settings page has an English and a Thai tab.

## Who can see what

| Role | Content | Booking requests |
|---|---|---|
| Administrator | All | Yes |
| Apex staff | None | Yes |
| Editor | All | No |

Give the front desk the Apex staff role. Give an outside agency Editor, which keeps the booking requests away from them.

Enquiries › Access log, for Administrators only, lists who opened, changed or deleted a booking request, exported or erased personal data, changed a setting or a role, and when staff with access to booking requests logged in. It keeps the newest 3,000 entries from the last 400 days.

## Booking requests and personal data

- The booking form asks for a name, phone number, treatment and preferred day, and a tick box agreeing to Apex keeping them. The site saves each request as a private Enquiry, emails the team a reference number and a link with the treatment and day only, and then opens LINE on the visitor's phone with the same message.
- Booking requests are deleted after 365 days. Enquiries › Settings changes the number; the privacy policy says 365, so change it there too.
- Tools › Erase Personal Data and Export Personal Data find booking requests by phone number.
- The form has a hidden trap field and allows 6 requests an hour from one connection.
- The cookie banner holds back analytics and advertising cookies until the visitor accepts (Google Consent Mode v2). Tags in the Tag Manager container must use Consent Mode for this to hold.
- The events the site sends to Tag Manager are `apex_area_pick` (a face area picked), `apex_compare` (two treatments compared), `apex_book_submit` (the booking form sent, with the treatment) and `apex_contact_click` (a LINE or phone link). Keep Google Ads, Meta and TikTok tags from reading the booking form, and turn off Meta's automatic advanced matching, which reads phone boxes on the page.
- After 8 wrong passwords for one username from one connection, that login waits 15 minutes.

## Checks before going live

From the site folder of the repository, with staging at `$SITE`:

```bash
python3 tests/wordpress/ssr.py $SITE     # every page matches the design (15 pages)
WP_PATH=/path/to/wordpress WP_USER=... WP_PASS=... python3 tests/wordpress/flows.py $SITE
```

`flows.py` sends a test booking and deletes it, checks the cookie banner, the redirects and Compare, and saves every Apex settings page and three treatments to check nothing changes. It needs Playwright and WP-CLI on the same machine, and a test administrator to delete afterwards.

Then by hand:

1. Send a booking and check the alert email arrives.
2. Open the request as an Apex staff user.
3. Submit the sitemap (`/wp-sitemap.xml`) in Google Search Console.
4. Measure Core Web Vitals with PageSpeed Insights on the home page and one treatment, mobile, with the cache on. Aim for LCP under 2.5 s, INP under 200 ms and CLS under 0.1.
5. Restore one backup to a spare copy.

## Updating the theme

Gid sends an update as a new `apex-contour-glow-theme-<version>.zip` with a note of what changed. The installed version is at the bottom right of every admin page and under Appearance › Themes.

1. Back up the database and `wp-content/`.
2. On staging, Appearance › Themes › Add New › Upload Theme, choose the zip and pick "Replace current with uploaded".
3. Check the pages the note names, then do the same on the live site.

Content, photos, booking requests and settings live in the database and `uploads/`, so a new theme leaves them as they are. **Don't run `wp apex import` on a site Apex has been editing** unless the update note asks for it, since the import writes the packaged content over the items with the same key.

For the developer: the static design is the source of the styles, scripts and 3D head, and `tools/*.py` build its pages. A change to page markup in a builder needs the same change in `inc/render.php`; `tests/wordpress/ssr.py` says where they differ. Then run `python3 wordpress/tools/build_theme.py`.

## Versions

| Version | Date | What changed | Run `wp apex import` after installing? |
|---|---|---|---|
| 0.1.0 | 15 Nov 2026 | First build, not yet sent to IT. English only. | Yes, the first time. |

Thank you. Send me anything that does not match this and I will fix it.
