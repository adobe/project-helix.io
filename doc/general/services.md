# External Services

Project Helix is using a serviceful architecture (i.e. not just serverless, but we try to use external services whenever we can avoid running our own), which means that we end up with significant number of external services to watch and manage.
This list serves as an overview.

## Adding a new Service

Add and fill following Markdown template to the bottom of the list

```markdown
### Service Name

What it does and why to use it. …

* [Log-In](https://…)
* [Documentation](https://…)

In order to get access, …

Current account holders:

* @name

Who pays for the service – or is this a free service.
```

## Non-Existent Services

These are services that we don't use yet – but should use at some time.

1. A code review service like https://codeclimate.com
2. Microsoft Azure for data collection and analysis

## Active Services

### Adobe I/O Runtime

Is responsible for the core functionality of Project Helix. Almost everyone needs access to this.

* Log-In: none, you will get a credentials file to put into `~/.wskprops`
* Documentation: none, but you can use the public [OpenWhisk documentation](https://github.com/apache/incubator-openwhisk/tree/master/docs)

In order to get access, go to the [`#adobeio-runtime` channel on Slack](https://adobe.slack.com/messages/C68UJPDM5/) and ask for an account, tagging `@mcorlan`

> Hey, @mcorlan, I'd like to get access to Adobe I/O Runtime to work on Project Helix. Thanks for your help.

Current account holders:

* @trieloff
* @stefan-guggisberg
* @kptdobe
* @tripodsan
* @ruxandraburtica
* @uncled

It's an Adobe-internal service and free to use for Adobe employees.

### NPM JS

Open Source packages are published to npmjs.com under the `@adobe` repo

* [Log-In](https://www.npmjs.com/login)
* [Documentation](https://docs.npmjs.com/)

In order to get access, contact Steve Gill on Slack, he maintains the Adobe NPM account

Current account holders:

* @trieloff
* @tripod
* @kptdobe

We are paying for NPM JS Pro, so that we can publish private packages if needed.

### Snyk

Snyk is a vulnerability monitoring service that continuously monitors our `package.json` files and alerts us through Slack when a vulnerability has been found in one of our dependencies.

* [Log-In](https://snyk.io/login) – works with GitHub Login
* [Documentation](https://snyk.io/docs/)

In order to get access, contact @trieloff

Current account holders:

* @trieloff

We are using the free service right now.

### Fastly

Fastly is our CDN and edge computing platform. If you need to change how HTTP requests and responses are handled, you need access to this configuration.

* [Log-In](https://manage.fastly.com)
* [Documentation](https://docs.fastly.com)

In order to get access, ping @trieloff on Slack.

Current account holders:

* @trieloff
* @stefan-guggisberg
* @tripodsan
* @dominique-pfister
* @ruxandraburtica
* @kptdobe

@CeceliaV manages the paid plan.

### Calibre

Calibre is a web performance monitoring tool. It monitors the performance of the Primordial Soup demo site on a nightly and per-build basis. You only need access if you want to set up custom performance monitoring.

* [Log-In](https://calibreapp.com/home)
* [Documentation](https://calibreapp.com/docs/help)

In order to get access, ping any of the users below on Slack (everyone is an admin)

Current account holders:

* @trieloff
* @tripodsan

@trieloff manages the paid plan.

### CircleCI

CircleCI is our CI and CD service. It is integrated with GitHub and configured by editing the `.circleci/config.yml` file in this repository.

* [Log-In](https://circleci.com/dashboard)
* [Documentation](https://circleci.com/docs/2.0/)

In order to get access to change configuration properties, i.e. to add environment variables for the build, you need to be an admin of the Project Helix GitHub repository. Request access publicly on the the [`#helix-chat`](https://adobe.slack.com/messages/C9KD0TT6G/) Slack channel.

Current GitHub admins:

* @davidnuescheler
* @noraacl
* @pthiess
* @stefan-guggisberg
* @trieloff
* @tripodsan
* @kptdobe

@CeceliaV manages the paid plan.

### Docker Hub

Docker Hub stores the [one public docker image](https://hub.docker.com/r/trieloff/custom-ow-nodejs8/) that is being used instead of `--kind nodejs:6` as the base image for Adobe I/O Runtime.

* [Log-In](https://hub.docker.com/login/)
* [Documentation](https://docs.docker.com/docker-hub/)

In order to get access, contact @trieloff

Current account holders:

* @trieloff

As we only use one public image, we are on a free plan.


### Loggly

Loggly is a log appender and reporting tool, similar to Splunk (but without the hosting overhead). Fastly logs are sent to Loggly.

* [Log-In](https://trieloff.loggly.com/login?next=)
* [Documentation](https://www.loggly.com/docs-index/)

In order to get access, connect with @trieloff.

Current account holders:

* @trieloff
* @ruxandraburtica
* @celiaV

We are currently using the $199/mo Pro plan with 15-day log retention.

### AWS S3

We use S3 for forwarding Fastly CND logs. More details about how we handle logs can be found in `logging/README.md`.


Current account holders:

* @ruxandraburtica

### AWS Lambda

Instructions on how to update the Lambda function can be found in the `logging/lambda` directory.

Current account holders:

* @ruxandraburtica

### Azure CosmosDB

We've created a resource group called `helix` in Azure, and we're storing data in [`helix-cosmosdb-mongo`](https://portal.azure.com/#@adobe.onmicrosoft.com/resource/subscriptions/0db92958-3ec7-42ed-89dd-ae47666126f5/resourceGroups/helix/providers/Microsoft.DocumentDb/databaseAccounts/helix-cosmosdb-mongo/overview), under the `helix` resource group.
It's possible to not have access to the Azure account, if you can't access the resource above, contact @ruxandraburtica