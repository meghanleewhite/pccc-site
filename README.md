# Psychiatric Care Coalition of Canada

Website for the Psychiatric Care Coalition of Canada (PCCC).

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies. Fonts are self-hosted so the site makes no third-party requests.

## Files

```
index.html          The whole site (one page)
404.html            Not-found page
css/styles.css      All styles. Desktop first, mobile below 900px
js/main.js          Menu, FAQ, count-up numbers, scroll fade-ins, carousel dots
assets/fonts/       Instrument Serif + Hanken Grotesk (woff2)
assets/images/      Hero illustration + founder photo (webp)
og-image.jpg        Link preview image (1200 x 630)
favicon.*           Browser tab icons (placeholder until the logo is final)
_headers            Cloudflare Pages security + caching headers
```

## Before launch: replace these placeholders

Search the project for `[` to find them all.

| Placeholder | Where | Replace with |
|---|---|---|
| `[SURVEYMONKEY LINK]` | index.html (survey button) | The live survey URL |
| `[SEASON 2027]` | index.html (survey copy) | When findings will be published |
| `[EMAIL]` | index.html (join + footer, 3 spots) | The public contact email |
| `[LINKEDIN LINK]` | index.html (footer) | The LinkedIn page URL |

Also confirm the survey tool is set to not collect IP addresses. The FAQ promises it.

## Run it locally

Any static server works:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Hosted on Cloudflare Pages, connected to this repo. Every push to `main` deploys automatically.

Cloudflare settings: framework preset **None**, build command **empty**, output directory **/**.
