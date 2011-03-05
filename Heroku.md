# Heroku

The Websolr add-on for [Heroku](http://heroku.com) allows you to use our managed search service with your Heroku app.

## Install the Add-on

```bash
$ heroku addons:add websolr
```

## Choosing a Solr Client

The Apache Solr search server presents an API, and there are a number of open source clients to choose from. We recommend Sunspot, although you may already be using another. We provide more general client configuration at the end of this document.

## Installing Sunspot with Rails 2.3

As of this writing, the current release of Sunspot is version 1.2.1. Sunspot provides a Rails plugin as a gem, named *sunspot_rails*.

### Installing Sunspot with Bundler

Rails 3 applications use Bundler by default. If you are developing a Rails 2.3 application, please review [Using Bundler with Rails 2.3](http://gembundler.com/rails23.html) to ensure that your application is configured to use Bundler correctly.

Once you have set up your application to use Bundler, add the *sunspot_rails* gem to your *Gemfile*.

```ruby
gem 'sunspot_rails', '~> 1.2.1'
```

Run *bundle install* to install Sunspot, and its dependencies, into your local environment.

## Configure Sunspot

By default, Sunspot 1.2.1 supports the *WEBSOLR_URL* environment variable used by your Heroku application in production.

If you would like more fine-grained control over which Solr servers you are using in different environments, you may run *script/generate sunspot* to create a Sunspot configuration file at *config/sunspot.yml*.

## Using Sunspot

With Sunspot you configure your models for searching and indexing using a Ruby DSL. By default, your records are automatically indexed when they are created and updated, and removed from the index when destroyed.

### Indexing Models

Here is a simple example of using Sunspot’s *searchable* block and DSL to configure an ActiveRecord model.

```ruby
class Post < ActiveRecord::Base
  searchable do
    text    :title
    text    :body
    string  :permalink
    integer :category_id
    time    :published_at
  end
end
```

To learn more, refer to the following article at the [Sunspot wiki](http://wiki.github.com/outoftime/sunspot/):

* [Setting up classes for search and indexing](http://wiki.github.com/outoftime/sunspot/setting-up-classes-for-search-and-indexing)

### Searching

To search the model in the above example, you may use something like the following:

```ruby
@search = Post.search { keywords 'hello' }
@posts  = @search.results
```

(If your model already defines a *search* method, you may use the *solr_search* method instead, for which *search* is an alias.)

Sunspot exposes the full functionality of Solr. To learn more about searching your models, refer to the following articles at the Sunspot wiki:

* [Full-text search with sunspot](http://wiki.github.com/outoftime/sunspot/fulltext-search)
* [Sunspot search options](http://wiki.github.com/outoftime/sunspot/working-with-search)


























