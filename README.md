# Finutia AI website

Static marketing, download, legal-placeholder, and web-app holding pages for Finutia AI.

This repository contains a **draft preview**. Its copy and legal text are not approved for
the custom domain. Search indexing is disabled until that approval is complete.

## Preview locally

From the repository root:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Release downloads

The three `download/latest/<platform>/` pages read the matching stable update manifest configured in
`download/latest/config.js`. They verify its P-256 signature with the same public key compiled into the
app. A download link is only shown when the signed manifest points to a canonical GitHub Release asset in
`capson22/finutia-site`.

## Finutia USBridge (`usbridge/`)

The USBridge tab. `usbridge/Finutia-USBridge-Web-Setup.exe` is the small installer built from the private USBridge
repository (`host/scripts/build-web-setup.ps1`, which checks it against the live release and copies it here): it
downloads the newest release from the public `capson22/Finutia-USBridge-Releases` and checks Finutia's update
signature before it runs anything. It only changes when its code or the update keys do, not with each release.
`usbridge.js` reads the newest release from GitHub's API (the one GitHub address a page may read) for the version
line and the full installer's link. The Android download links to the newest release's app at its fixed address,
`https://github.com/capson22/Finutia-USBridge-Releases/releases/latest/download/Finutia-USBridge.apk`; the script
shows its version, or "Not available yet." (button hidden) while the newest release has no app. The app checks
Finutia's update signature itself for every update after the first install.

## Domain cutover (owner action)

Do not add `CNAME` or change GitHub Pages' custom-domain setting until every word has been approved.
The staged `app/` page is a source copy for the separate `app.finutia.com` VPS host; it cannot be hosted
at that subdomain by the same GitHub Pages site.

## Search launch gate

The site is deliberately excluded from search while its copy and legal text are under review:

- `robots.txt` disallows the entire site.
- Every HTML page carries a `noindex` directive.
- `sitemap.xml`, canonical URLs, social metadata, and structured data are prepared but do not override those blocks.

Only after owner approval:

1. Remove `noindex` from pages intended for search. Keep it on the 404 and web-app holding page.
2. Change the general `robots.txt` rule to allow crawling and add `Sitemap: https://finutia.com/sitemap.xml`.
3. Allow `OAI-SearchBot` for ChatGPT Search. `GPTBot` can remain separately disallowed if training access is not wanted.
4. Verify the domain in Google Search Console and Bing Webmaster Tools, submit the sitemap, and inspect the live URLs.
