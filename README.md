# project-helix.io

Project Helix documentation site based on… Helix!

Check [www.project-helix.io](http://www.project-helix.io/index.html).

## Installation

Clone current repo and simply run `hlx up`.

If you want to see content from remote repository, run `git submodule init`

If you want to locally emulate the behaviors on the public host (especially when working with navigation links, multiple content repos with one code repo...), use:

```bash
hlx up --host www.project-helix.io
```

## Deployment and publication

### Setup

Ensure that you have the correct environment variables set in your `.env` file:

```bash
$ ln -s secrets/helix.env .env
$ cat .env
HLX_WSK_NAMESPACE=helix-pages
HLX_WSK_AUTH=...
HLX_FASTLY_NAMESPACE=...
HLX_FASTLY_AUTH=...
```

If the `secrets/helix.env` env file is missing, you need to decrypt it first. We're using [BlackBox](https://github.com/StackExchange/blackbox) to encrypt sensitive information in the git repository, e.g. the `secrets/helix.env` file containing API tokens, keys etc. If you are new to [BlackBox](https://github.com/StackExchange/blackbox) follow the [Installation instructions](https://github.com/StackExchange/blackbox#installation-instructions) and refer to the [BlackBox Commands](https://github.com/StackExchange/blackbox#commands).

Once you've added yourself as an admin via `blackbox_addadmin <email address>` (and committed the changes), one of the existing admins will need to re-encrypt the files. Check the list of admins (`blackbox_list_admins`) and contact one of them. Once the admin re-encrypted the files you will be able to run:

```bash
blackbox_decrypt_all_files
```

### Deploy

```bash
hlx deploy --default REPO_RAW_ROOT https://raw.githubusercontent.com --default REPO_API_ROOT https://api.github.com/
```

### Publish

```bash
hlx publish
```
