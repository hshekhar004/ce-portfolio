# GitHub Pages deployment and update guide

## First publication

1. Open your `YOURUSERNAME.github.io` repository.
2. Upload the complete contents of this V4 folder. `index.html` must be at the repository root.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**, then `main` and `/ (root)`.
5. The portfolio will appear at `https://YOURUSERNAME.github.io`.

## Future content updates

1. Open the live portfolio and select **Owner login** in the footer.
2. Edit any content or design setting.
3. Press **Save changes**. This saves a private draft in that browser; visitors still see the published version.
4. Open **Preview site** and check the result.
5. Press **Export content.js**.
6. In GitHub, open the `js` folder, upload the newly downloaded `content.js`, replace the existing file, and commit.

Replacing `js/content.js` is the publishing step. Do not replace the other website files for routine content changes.

## CV, thesis, degree certificates, and other documents

- PDF files uploaded through Owner Studio are embedded into the exported `content.js`.
- Thesis summary, complete thesis, and every degree certificate open inside the same website viewer and expose Download only after the viewer opens.
- Keep each uploaded file below 8 MB so the one-file GitHub workflow remains reliable. Compress large PDFs before uploading.
- The included CV currently uses files in `assets`. You may either replace those files using the same names or upload a new CV through Owner Studio and publish the exported `content.js`.
- Any document visible in a browser can still be saved or captured. Upload only public-safe or redacted documents.

## Owner-login security

GitHub Pages has no private server. Owner Studio compares a one-way SHA-256 fingerprint and rejects incorrect credentials, but the final protection is your GitHub account: no visitor can publish a draft without access to your repository.

Use a strong password that is unique to this portfolio. To change it, log in, open **Advanced**, set the new credentials, save, export `content.js`, and replace the file on GitHub.

If you forget the password, generate a new SHA-256 hash for `USERNAME:NEW_PASSWORD`, replace `security.adminHash` in `js/content.js`, and commit through your GitHub account.
