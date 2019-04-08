# Troubleshooting Helix

## During (Local Development)

### Increase the Log Level

Start `hlx up --log-level debug` to increase the log level. Other possible values are `verbose` and `silly`. With `hlx up --log-file mylog.log` you can set the file location for the log file.

### Check the Payload in the Browser

While running `hlx up`, you can add `?debug=true` to any URL to see the current content of the `context` pipeline payload in your browser's JavaScript Console. It is useful when writing HTL to remember the exact object structure of all properties that are available in the `context`.

### Check in Pipeline Payload

Every time you make a request to Helix running in development mode (i.e. when using `hlx up`) or running a unit test, the contents of the pipeline will be dumped into the directory `logs/debug/*`. Each request creates one subdirectory and each subdirectory contains one JSON file for each step of the pipeline.

This gives you a very fine-grained insight into the pipeline.

### Use the Debugger

You can debug your HTL scripts and your `pre.js` using the built-in node.js debugger. Whenever `hlx up` is run, the debugger is launched, and you can attach your debugger, e.g. [Visual Studio Code](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_attaching-to-nodejs)

## In Production

### Use the `X-Debug` Header

Helix strips out most unneccessary response headers in the CDN. You can enable debug headers by making a request that includes the `X-Debug` request header with any value. 

```bash
$ curl -I -H "X-Debug: true" https://www.project-helix.io/index.html
HTTP/2 200
access-control-allow-headers: *
access-control-allow-methods: OPTIONS, GET, DELETE, POST, PUT, HEAD, PATCH
access-control-allow-origin: *
content-type: text/html; charset=UTF-8
perf-br-resp-out: 1542878687.219
server: api-gateway/1.9.3.1
x-content-type-options: nosniff
x-frame-options: deny
x-gw-cache: MISS
x-openwhisk-activation-id: 2c642c9aca404baba42c9aca40fbab24
x-request-id: Sqe1MRYwgeirtA5l1YxWy5LPd6WHujZo
x-xss-protection: 1; mode=block
x-backend-name: 3t7g8apsfQlFyvuHIQn9e8--F_AdobeRuntime
x-cdn-request-id: 3f6e5147-1e8d-4102-8a39-173f3c6c0af2
cache-control: max-age=604800, public
date: Thu, 22 Nov 2018 09:25:21 GMT
via: 1.1 varnish
age: 34
x-served-by: cache-lhr6320-LHR
x-cache: HIT
x-cache-hits: 1
x-timer: S1542878721.015028,VS0,VE4
vary: X-Debug, X-Strain
strict-transport-security: max-age=31536000; includeSubDomains
x-version: 100; src=100; cli=0.9.2-pre.4; rev=c25e2133d8bce6c5812a774fa272ad73a8d33458
x-backend-url: /api/v1/web/helix/default/git-github-com-adobe-project-helix-io-git--master--html?owner=adobe&repo=project-helix.io&ref=master&path=/index.md&selector=&extension=html&branch=master&strain=default&params=(null)
x-branch: master
x-strain: default
x-github-static-ref: @(null)
x-action-root: /helix/default/git-github-com-adobe-project-helix-io-git--master--
x-url: /index.html
x-root-path:
set-cookie: X-Strain=default; Secure; HttpOnly; SameSite=Strict;
```

### Disable the Static Fallback

The default processing path is to first make a request to the pipeline action, and if that produces an error 404, to fall back to the static action.
This can lead to the static action obscuring error messages (and headers) coming from the pipeline action or the OpenWhisk Runtime.

In order to disable this fallback, add the request header `X-Disable-Static: true`.

### Force-load a Strain

In order to override the strain selection that happens in the CDN, make a request with the `X-Strain` request header. 

### Call OpenWhisk via HTTP

You can make requests directly to OpenWhisk to see the raw response. The `x-backend-url` header from above gives you an indication of the URL to use:

```bash
$ curl "https://adobeioruntime.net/api/v1/web/helix/default/git-github-com-adobe-project-helix-io-git--master--html?owner=adobe&repo=project-helix.io&ref=master&path=/index.md&selector=&extension=html&branch=master&strain=default&params=(null)"
```

### Call OpenWhisk using the OpenWhisk Developer Tools

If you have the `wsk` OpenWhisk Command Line installed, you can also make requests to OpenWhisk using `wsk` to see the raw (JSON) response:

```bash
$ wsk action invoke git-github-com-adobe-project-helix-io-git--master--html --blocking --result -p owner adobe -p repo project-helix.io -p ref master -p path index.md -p extension html -p branch master -p strain default
```

### Check OpenWhisk Logs

Use `wsk activation poll` or `wsk activation logs 2c642c9aca404baba42c9aca40fbab24` to see all OpenWhisk logs or the logs for a particular activation. The `x-openwhisk-activation-id` header from above gives you the activation ID.

### Debug OpenWhisk action

While it's not possible to debug actions deployed in the cloud we can emulate the OpenWhisk runtime environment by running the same Docker image as used in the cloud locally.

#### 0. Pre-Requisites

You'll need [Docker](https://www.docker.com/) installed on your local machine. You'll also need a properly set-up Helix development environment, see [Getting Started](https://github.com/adobe/helix-home/blob/master/getting-started.md) for instructions.

##### Install utilities

To install [HTTPie](https://httpie.org/) and [jq](https://stedolan.github.io/jq/) on a Mac:

```bash
brew install httpie jq
```

#### 1. Start OpenWhisk Node.js action runtime container

```bash
docker run -p 8080:8080 -p 9229:9229 -it adobeapiplatform/adobe-action-nodejs-v10:3.0.17 node --inspect=0.0.0.0:9229 app.js
```

#### 2. Build .zip archive of action

In your project directory:

```bash
# create action zip file (will generete .hlx/build/html.zip)
hlx deploy --dry-run
```

#### <a name="3_deploy"></a>3. Deploy action locally

```bash
cd .hlx/build
# create json file with Base64 encoded action zip file content
base64 html.zip | tr -d '\n' | jq -sR '{value: {main: "main", binary: true, code: .}}' > html.json
# deploy the action to the Node.js runtime in your docker container
http post localhost:8080/init < html.json
```

#### 4. Connect VSCode Debugger to the action runtime container

Launch VSCode, switch to Debug View, add the following launch configuration:

```json
{
    "type": "node",
    "request": "attach",
    "name": "Attach to OpenWhisk docker",
    "address": "127.0.0.1",
    "port": 9229
}
```

... and attach the debugger (`F5`). On the lower left you'll see the `LOADED SCRIPTS` tree:

![Loaded source files](/assets/LOADED_SCRIPTS.png)

Navigate to the source code of your action and bundled dependencies and set breakpoints where appropriate.

#### 5. Invoke action and start debugging

```bash
# encode action paramters as json
echo '{ "value": { "owner": "adobe", "repo": "project-helix.io", "ref": "master", "path": "index.md", "extension": "html", "branch": "master", "strain": "default" } }' > params.json
# invoke the action
http post localhost:8080/run < params.json
# or, alternatively, using curl
curl -v -H "Content-Type: application/json" --data @params.json http://localhost:8080/run
```

The VSCode Debugger will (hopefully) stop at a breakpoint you set in the preceeding step.

#### Optional: Debug -> Edit -> Debug -> ... development cycle

##### Make changes to your action or bundled dependencies code:

```bash
# cd <your project>/.hlx/build
# unpack the .zip archive you built and deployed in the previous steps
unzip html.zip -d html
cd html
# make changes to extracted action and dependencies code ...
# recreate archive
rm ../html.zip
zip -r ../html.zip .
cd ..
```

##### Restart the docker container

```bash
docker ps
# copy CONTAINER ID
docker restart <CONTAINER ID>
```

##### Re-deploy action

Continue with [3. Deploy action locally](#3_deploy)

#### Optional: Manually deploy and invoke the same action on Adobe I/O Runtime:

```bash
# deploy
wsk action create <action name> --kind nodejs:10 html.zip
# invoke via wsk
wsk action invoke <action name> -p owner adobe -p repo project-helix.io -p ref master -p path index.md -p extension html -p branch master -p strain default --result
# invoke via curl
wsk action get <action name> --url
curl -v "<action url>?owner=adobe&repo=project-helix.io&ref=master&path=/index.md&selector=&extension=html&branch=master&strain=default&params=(null)"
```

#### Some related links

* [Adobe I/O Runtime Developer Guide](https://github.com/AdobeDocs/adobeio-runtime/tree/master#adobe-io-runtime-developer-guide)
* [Debugging Node.js OpenWhisk Actions](https://medium.com/openwhisk/debugging-node-js-openwhisk-actions-3da3303e6741)