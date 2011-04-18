# Quick start for the [[Sunspot]] Solr client for Ruby

[[Solr clients]] > [[Sunspot]]

Here's a quick start guide for getting started with the latest version of the Sunspot Solr client for Ruby. By the end of this guide, you should have working full-text search in your development environment, powered by a locally running Solr instance.

## Installing Sunspot

First, install the `sunspot_rails` gem in your `Gemfile`:

##### Gemfile
```ruby
gem 'sunspot_rails'
```

Next, install the gem into your bundle by running `bundle install` on the command line.

    bundle install

## Starting Solr

Next, you can start a local instance of Solr by using one of Sunspot's provided rake task.

    rake sunspot:solr:start

This rake task also creates a `solr/conf` directory, which contains default configuration files for your local Solr instance, as well as a `solr/data` directory for the Solr index itself.

You should ignore the `solr/data` directory by adding the following to your `.gitignore` file:

##### .gitignore
    solr/data

With a local instance of Solr up and running, it's time to configure your models to be searchable.

## Indexing your models

Sunspot provides the `searchable` class methods for you to configure how your models are to be indexed. This lets you specify the fields you would like to have indexed, and the Solr data type you would like them to be indexed as.

For a simple example, consider a Post model with a `title` field and a `content` field. We will index these fields as Solr `text` fields.

```ruby
class Post < ActiveRecord::Base
  searchable do
    text :title
    text :content
  end
end
```

For more information about data types, take a look at our guide to [[Solr data types]].

Whenever you make changes to how your models are indexed, you will need to rebuild your index for any existing data in your database. To do so, run Sunspot's "reindex" rake task:

    rake sunspot:reindex

With that, your data should now be indexed and ready to search.

## Searching your models

Sunspot provides a Ruby-based DSL for generating sophisticated search queries. This method is called `solr_search` which is also aliased to `search` if your class does not already respond to that method. The `solr_search` method accepts a block, and returns a search result object that wraps the response from Solr.

Here's a simple search against the Post class that we indexed above, running from the index action of the `PostsController`:

```ruby
class PostsController < ApplicationController
  def index
    @search = Post.search do
      keywords params[:query]
    end
    @posts = @search.results
  end
end
```

- The `keywords` method accepts a query string and performs a keyword-based search against your `text` fields.
- The `solr_search` method returns a search object which wraps the entire response from Solr, including values for the query time, total number of results found, and so on.
- The `@search` object provides a `results` method that fetches the full ActiveRecord objects that correspond to the results returned by Solr.

Finally, showing your search results can be as simple as rendering that `@posts` variable like any other collection of ActiveRecord objects. Sunspot also supports WillPaginate.

```erb
<%= render @posts %>
```

## That's it!

You should now have a working search locally.

For more information, check out our [[Sunspot]] guides page.