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

## Domain cutover (owner action)

Do not add `CNAME` or change GitHub Pages' custom-domain setting until every word has been approved.
The staged `app/` page is a source copy for the separate `app.finutia.ai` VPS host; it cannot be hosted
at that subdomain by the same GitHub Pages site.
