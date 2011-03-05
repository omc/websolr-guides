# Heroku Add-on

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

To learn more, refer to the following article at the [Sunspot wiki](http://wiki.github.com/outoftime/sunspot):

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

## Sunspot Rake Tasks

Sunspot provides Rake tasks to start and stop a local Solr server for development and testing. In order to use these Rake tasks, add the following line to your application’s *Rakefile*:

```ruby
require 'sunspot/rails/tasks'
```

You may wish to familiarize yourself with the available tasks by running *rake -T sunspot*.

### Running a local Solr server with Sunspot

To start and stop a local Solr server for development, run the following rake tasks:

```ruby
rake sunspot:solr:start
rake sunspot:solr:stop
```

### Re-indexing Data

If you are adding Websolr to an application with existing data in your development or production environment, you will need to “re-index” your data. Likewise, if you make changes to a model’s *searchable* configuration, or change your index’s configuration at the [Websolr control panel](http://websolr.com/slices), you will need to reindex for your changes to take effect.

In order to reindex your production data, you may run a command similar to the following from your application’s directory:

```ruby
heroku rake sunspot:reindex
```

If you are indexing a large number of documents, or your models us a lot of memory, you may need to reindex in batches smaller than Sunspot’s default of 50. We recommend starting small and gradually experimenting to find the best results. To reindex with a batch size of 10, use the following:

```ruby
heroku rake sunspot:reindex[10]
```

Refer to *rake -T sunspot* to see the usage for the reindex task.

### Indexing Asynchronously with Heroku Workers

Queuing your updates to Solr is a perfect job for Heroku’s [Delayed Job Workers](http://devcenter.heroku.com/articles/delayed-job). Sending updates to Solr has the advantage of increasing your application’s performance and robustness. Simply add the following line to your model after the *searchable* block:

```ruby
handle_asynchronously :solr_index
```

## Using a Different Solr Client

There are other Ruby clients, including the venerable *acts_as_solr*. If you are already using one of these clients and are not interested in switching your application to Sunspot, here are a few pointers for using Websolr in production.

Your index’s URL is set in the *WEBSOLR_URL* environment variable. If your Solr client can be configured at runtime, we recommend creating a Rails initializer at *config/initializer/websolr.rb* in which you instruct your client to connect to *ENV['WEBSOLR_URL']* when present.

Alternatively, you may run *heroku config --long* from your application’s directory to view the value for *WEBSOLR_URL* and update the relevant configuration file for your particular Solr client.

## Configuring your index

When your index is first created, it will be automatically configured using the *schema.xml* for the latest version of Sunspot, which is a very flexible schema that can cover a lot of uses.

Websolr provides a control panel at [http://websolr.com](http://websolr.com) where you may make changes to your index, such as adding or removing different Solr features, selecting a different Solr client, providing your own *schema.xml* and so on.

You may log in to the Websolr control panel at [http://websolr.com](http://websolr.com) using your account’s Websolr username and password, which you may find by running *heroku config --long* from your application’s directory.

