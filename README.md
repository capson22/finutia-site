# Finutia website

Static company, product, download, legal-placeholder, and web-app holding pages for Finutia.

Finutia is a software company owned by Capson Enterprises. The public site currently has
top-level product pages for Finutia AI Assistant and USBridge, plus Home and Contact pages.

The custom domain currently serves a **draft preview**. Its copy and legal text are not approved
for launch. Search indexing is disabled until that approval is complete.

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

## Hosting

GitHub Pages serves the marketing site at `finutia.com`. The staged `app/` page is a source copy for
the separate `app.finutia.com` VPS host; it cannot be hosted at that subdomain by the same GitHub Pages
site.

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
