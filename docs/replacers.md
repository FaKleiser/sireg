# sireg Replacers

Replacers are used to modify the URLs loaded by any loader.
By modifying the URL you have the option to change the target of the HTTP requests being fired.

## Static Replacer

The static replacer replaces the exact string with the replacement provided.
This is very useful in combination with the sitemap loader!

```json
{
  "replacers": [
    {
      "replacer": "static",
      "options": {
        "replace": "http://<DOMAIN>/",
        "with": "http://localhost:8080/"
      }
    }
  ]
}
```