# project-helix.io

Project Helix documentation site based on… Helix!

Check [www.project-helix.io](http://www.project-helix.io/index.html)... coming soon!

## Installation

Clone current repo and simply run `hlx up`.

If you want to see content from remote repository, run `git submodule init`

## Deploy

**pre reqs:**
- wsk auth for `helix` namespace (`HLX_WSK_NAMESPACE=helix`)
- fastly namespace for `www.project-helix.io`
- fastly auth token

**deploy**

```bash
hlx deploy --no-auto --default REPO_RAW_ROOT https://raw.githubusercontent.com --default REPO_API_ROOT https://api.github.com/
```

**publish**

```bash
hlx publish
```

