# Åndalsnes Docs

A lightweight static website that publishes the Åndalsnes municipality Kraftfondet
meeting archive on GitHub Pages. The site offers a searchable index over all
available JSON datasets in this repository and links directly to the source
files for reuse.

## Local development

Because the site is a simple static bundle, you can preview it by serving the
repository with any HTTP server. For example, using Python:

```bash
python3 -m http.server --directory .
```

Then open <http://localhost:8000> in your browser.

## Deployment

GitHub Pages will automatically serve the content in the `main` branch. No
additional build steps are required.
