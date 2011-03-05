# Heroku

The Websolr add-on for Herkou allows you to use our managed search service with your Heroku app.

## Install the Add-on

```bash
$ heroku addons:add websolr
```

## Choosing a Solr Client

The Apache Solr search server presents an API, and there are a number of open source clients to choose from. We recommend Sunspot, although you may already be using another. We provide more general client configuration at the end of this document.

Installing Sunspot with Rails 2.3

As of this writing, the current release of Sunspot is version 1.2.1. Sunspot provides a Rails plugin as a gem, named *sunspot_rails*.

