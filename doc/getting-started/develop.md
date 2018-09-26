# Develop your Helix Site

## Pre-Requisites

1. Node 8 (or later) and corresponding `npm` 

2. `git` & GitHub account

3. Helix CLI from https://github.com/adobe/helix-cli

```bash
npm install -g @adobe/helix-cli
```

## Initialize your new project with sample code

Run:

```bash
hlx demo mytestproject
cd mytestproject
```

The `mytestproject` folder contains everything you need to start "coding" your website. Main entry point is the HTL template `src/html.htl` that defines the HTML of your webpages.

While Helix supports a pure local developement code base, it could be a good idea to set the `git remote`, the place where you will store your code.

* Go to [http://github.com/](http://github.com/) and create a new `mytestprojectcode` repository in your favorite org.
* Add the remote locally:

```bash
git remote add origin <mytestprojectcode_git_repo_url>
```

You can then commit and push your code.

## Develop locally

Run:

```bash
hlx up
```

Open the url [http://localhost:3000/](http://localhost:3000/)

A default page is rendered. You can change the HTL template `src/html.htl` and reload the page, changes will be automatically applied.

## Where is the content

### Local content

During the project init, one file has been created locally: `index.md`. You can change the content and reload the page, changes will be automatically applied. You can create more files, like a `test.md` and request [http://localhost:3000/test.html](http://localhost:3000/test.html) to see the content.

This is really useful for local and offline development but this is not where the content should reside.

### Content stored on github

* Go to [http://github.com/](http://github.com/) and create a new `mytestprojectcontent` repository in your favorite org. Add a `index.md` file in here.
* In mytestproject, edit the `helix-config.yaml`: uncomment the `contentRepo` property and put your repository URL.
* Restart `hlx up`

Open the url [http://localhost:3000/](http://localhost:3000/): the content is coming from the `mytestprojectcontent` git repository.
