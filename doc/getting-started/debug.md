# Where is the content ?

## Local content

During the project init, one file has been created locally: `index.md`. You can change its content and reload the page, changes will be automatically applied. You can create more files:

1. create a `test.md` file and add content in it
2. open [http://localhost:3000/test.html](http://localhost:3000/test.html) to see your new content

This is really useful for local and offline development but this is not where the content should reside.

## Content stored on github

Here are the instructions to store your content on github and tell Helix to consume the content from github and not locally:

1. Go to [http://github.com/](http://github.com/)
2. Create a new `hellohelixcontent` repository in your favorite org
3. Add a `index.md` file with some content
4. In your Helix project, create a new `helix-config.yaml` file add the root
5. Add following line to file (and replace `<your org>`)

```yaml
contentRepo: https://github.com/<your org>/hellohelixcontent
```

6. Restart `hlx up`

Open the url [http://localhost:3000/](http://localhost:3000/): the content is now coming from the `hellohelixcontent` git repository.
