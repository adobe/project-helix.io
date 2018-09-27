<!--
/*
* Copyright 2018 Adobe. All rights reserved.
* This file is licensed to you under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License. You may obtain a copy
* of the License at http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software distributed under
* the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
* OF ANY KIND, either express or implied. See the License for the specific language
* governing permissions and limitations under the License.
*/
-->
  
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
* In mytestproject, add a new `helix-config.yaml` file.
* Add the following line to `helix-config.yaml`: `contentRepo: https://github.com/<your_org>/mytestprojectcontent`
* Restart `hlx up`

Open the url [http://localhost:3000/](http://localhost:3000/): the content is coming from the `mytestprojectcontent` git repository.
