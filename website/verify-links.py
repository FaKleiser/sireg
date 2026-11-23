"""Verify local links, anchors, and assets in the generated Pages site."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.links = []
        self.ids = set()
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name == "id":
                self.ids.add(value)
            if name in ("href", "src") and value:
                self.links.append(value)


output = Path("website/public")
prefix = "/sireg/"
pages = {path: Page(path) for path in output.rglob("*.html")}
if output / "index.html" not in pages:
    raise SystemExit("Build the docs before checking links.")

errors = []
for path, page in pages.items():
    route = prefix + path.relative_to(output).as_posix()
    for link in page.links:
        url = urlsplit(urljoin(route, link))
        if url.scheme or url.netloc:
            continue
        if not url.path.startswith(prefix):
            errors.append(f"{route} links outside {prefix} to {link}")
            continue
        target = output / unquote(url.path.removeprefix(prefix))
        if url.path.endswith("/"):
            target /= "index.html"
        if not target.is_file():
            errors.append(f"{route} links to missing file {link}")
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f"{route} links to missing fragment {link}")

if errors:
    raise SystemExit("\n".join(errors))
print(f"Checked internal links, anchors, and assets across {len(pages)} HTML pages.")
