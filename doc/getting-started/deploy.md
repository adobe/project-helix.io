# Deploy your Helix Site

Only assumption taken for now is that we'll leverage `primordialsoup.life` Fastly service. Configuring a new service will be documented later.

Goal: create the new content-manageable website [](https://mytestproject.primordialsoup.life)

## Pre-requisites

* Get [access](https://github.com/adobe/project-helix/blob/master/SERVICES.md#fastly) to [primordialsoup.life](https://manage.fastly.com/configure/services/3l2MjGcHgWw5NUJz7OKYH3) Fastly service
* Get [access](https://github.com/adobe/project-helix/blob/master/SERVICES.md#adobe-io-runtime) to Adobe I/O Runtine.
* Install the [Helix Command Line Interface](https://github.com/adobe/helix-cli)

## Fastly

### Onboarding a Domain

1. Log in to https://manage.fastly.com/account/tls/domains
2. Click "create TLS domain" https://manage.fastly.com/account/tls/domains/new
3. Enter the domain name with a wildcard qualifier: e.g. `*.experience-adobe.com`
4. Click next
5. In the list of domains, click "verify" next to your new domain name
6. Copy the `TXT` record and set it as a new DNS record (for `@`)
7. Be patient, as DNS propagation can take an hour
8. Click verify

### Creating a Fastly Service

1. Log in to https://manage.fastly.com/services/all
2. Click "create service" or go to https://manage.fastly.com/configure/services/new
3. Enter name for the service, e.g. `experience-adobe.com`
4. Enter the domain, using the wildcard qualifier, e.g. `*.experience-adobe.com` (this allows you to easily map subdomains to strains)
5. Enter `example.com` for "Address" – this field will be overridden later on
6. Click "no, do not verify my TLS certificate"
7. Click "create"
8. Copy and remember the service ID `37kYmSvxGEHwUlWz7r8EWE`
