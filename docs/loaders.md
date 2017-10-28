# sireg Loaders

Loaders are used to setup your test.
They provide a collection of URLs to examine.

## Sitemap Loader

The sitemap loader loads all URLs from the supplied sitemap.

```json
{
  "loaders": [
    {
      "loader": "sitemap",
      "options": {
        "sitemap": "http://<DOMAIN>/sitemap.xml"
      }
    }
  ]
}
```



## File Loader

The file loader loads a set of URLs to analyze from a file.
Each line of the given file must be a valid URL.

```json
{
  "loaders": [
    {
      "loader": "file",
      "options": {
        "path": "path/to/urls.txt"
      }
    }
  ]
}
```