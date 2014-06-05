---
layout: page
title: EngineYard
css: index
js: index
---

## Get started in development

You will want to choose a Solr client. We recommend [Sunspot](https://github.com/sunspot/sunspot).

Check out our [Sunspot Quick Start](/guides/rails/sunspot-quick-start.html) to get up and running in your development environment.

## Deploying to production

### Create your index

#### 1. Sign up for Websolr at [http://websolr.com/plans](http://websolr.com/plans)

New customers hosting on Engine Yard may use the coupon code `ENGINEYARD` during signup to receive your first month for free. (Up to $100.)

#### 2. Create an index

Choose a client configuration -- we recommend the latest Sunspot.

#### 3. Configure your client

Configure your Solr client to use the URL for your index (`http://index.websolr.com/solr/0a1b2c3d4e…`)

Sunspot natively supports the `WEBSOLR_URL` environment variable. You may also choose to create a `config/sunspot.yml` file like the following, using the values for your newly-created index:

{% highlight yaml %}
production:
  solr:
    hostname: index.websolr.com
    port: 80
    path: '/solr/a0b1c2d3e'
    log_level: WARNING

development:
  solr:
    hostname: localhost
    port: 8982
    log_level: INFO

test:
  solr:
    hostname: localhost
    port: 8981
    log_level: WARNING
{% endhighlight %}

### Release & reindex your data

Immediately after releasing your changes, you need to reindex your data for your search to work. Sunspot provides the `sunspot:reindex` task, which you may run from the command line, or as part of a `deploy:long` task in your Capistrano deploy file.

    rake sunspot:reindex

## You're done!

At this point, your new full-text search should be up and running.

If you have any questions or comments, feel free to [get in touch](/contact) and let us know.