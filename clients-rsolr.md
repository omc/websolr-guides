# RSolr

* [[Solr Clients|clients]]

RSolr is a Ruby client for Solr. It is designed to be a simple, low-level wrapper that provides direct access to the Solr API. As such, its use encourages familiarity with the Solr API, which in turn offers simple, direct access to Solr.

This document provides a basic overview of common RSolr usage. You can find RSolr's comprehensive official documentation at its source repository on GitHub at [https://github.com/mwmitchell/rsolr](https://github.com/mwmitchell/rsolr).

## Installation

RSolr is distributed as a Ruby Gem. To install it using the command-line RubyGems tool, simply run:

```sh
gem install rsolr
```

To use RSolr with Bundler in your Rails, Sinatra or other Ruby application, you can include the following in your `Gemfile`:

```ruby
gem 'rsolr'
```

## Basic usage

When using RSolr, you need to specify the URL of the Solr index which you are connecting to. This can be done by passing a `:url` option to the `RSolr.connect` method, which returns a `RSolr::Client` object for you to use in indexing and searching your data.

```ruby
rsolr = RSolr.connect :url => 'http://index.websolr.com/solr/a1b2c3d4e5f'
```

We will refer back to this `rsolr` object throughout the rest of the documentation.

### Indexing & updating your data

The RSolr client's `add` method accepts a simple Ruby hash, which it will post to Solr as a document to index.

```ruby
rsolr.add(:id => 1, :name => "Hello, world", :body => "Two roads diverged in a wood...")
```

It can also accept an array of hashes to index:

```ruby
rsolr.add([
  { :id => 1, :name => "Hello, world", :body => "Two roads diverged in a wood..." },
  { :id => 2, :name => "Adventurous", :body => "I shall be telling this with a sigh..." }
])
```

You can issue a commit using the `commit` method:

```ruby
rsolr.commit
```

_Note: For performance reasons, indexes on Websolr ignore client-issued commits, deferring instead to a pre-configured autoCommit policy._

### Searching your documents

The RSolr client provides a `select` method which sends requests to the Solr `/select` handler. It accepts a hash of parameters, which it serializes into the query string of its request.

Here is a simple example, using the `q` param to perform a keyword query:

```ruby
search = rsolr.select :params => { :q => "keywords" }
```

Note that in this example, the query is performed according to the query parser settings defined in `solrconfig.xml` and potentially your default query field specified in `schema.xml`. Here is a more explicit search using the [[DisMax query parser|solr-features-dismax-query-parser]] to search our example `name` and `body` fields.

```ruby
search = rsolr.select :params => { :q => "keywords", :defType => "dismax", :qf => "name body" }
```

The return value of this search is a Ruby hash corresponding to the response from the Solr server. Here is a sample search response:

```ruby
{
  'responseHeader' => {
    'status' => 0,
    'QTime' => 2,
    'params' => {
      'wt' => 'ruby'
    }
  },
  'response' => {
    'numFound' => 94727,
    'start' => 0,
    'docs' => [
      {
        'id' => 1,
        'name' => 'Hello, world',
        'body" => 'Two roads diverged in a wood...'
      },
      # ...
    }
  }
}
```

By default, RSolr will evaluate the response into a Ruby hash, which you can use in your application to present the search results.

```ruby
search['responseHeader']['QTime'] # => 2
search['response']['docs'] # => [ { 'id': 1, ... }, ... ]
```

In addition to the `searchHeader` and `response` blocks, there may be others — such as `[[spellcheck|solr-features-spellcheck]]` — depending on how you have configured your index.