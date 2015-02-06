# Websolr routing headers

All of our plans, from Chromium and higher, are provisioned using a master-replica data model. The default behavior is to route all requests to the master core, and use Solr's replication mechanism to pull changes into the replica. This behavior is designed to facilitate near real time (NRT) searches and improve availability.

However, there are certain use cases in which this default behavior needs to be changed. Websolr offers a mechanism to handle how traffic is routed for your application. We provide a parameter, `X-Websolr-Routing`, which can be included in the header of a request and supports three possible settings: `prefer-master`, `prefer-replica`, `prefer-random`. These options are discussed in detail below. Note that update traffic will always be made to the master index.


## prefer-master

This is the default behavior. A common reason for using this setting would be to use near real time searches and improve availability. Under this behavior, if the master server becomes unavailable, the replica is automatically used instead. The worst case scenario is a loss of up to a minute of writes.


## prefer-replica

In some high-load applications that don't require NRT searches, it makes more sense to distribute the load in such a way that heavy writes don't affect search speed. Update traffic can be routed to the master, while search traffic is routed to the replica and Solr's replication mechanisms pull in fresh updates every minute. The benefit here is that search speed remains relatively consistent, regardless of what sort of volume of writes are occurring at any given time. The downside is that near real time search is not possible; writes will become available after a minute or so.


## prefer-random

This option is a trade off between the other two. Updates are still routed to the master index, but search traffic is randomly distributed between the master and replica. This has the benefit of shifting some load off the master server, while reducing the *average* time before a newly-added document becomes available for search. The downside again is that near real time searches are not possible.


# Using these headers

There are a few ways that these parameters can be used. This section covers some common ways of doing it. If you need something else, please [let us know](mailto:support@onemorecloud.com).


## curl

The request headers can be included in a curl command like so:

`curl -H "X-Websolr-Routing:prefer-replica" http://index.websolr.com/solr/a1b2c3d4e5/select`


## Sunspot

You can include a new initializer `rsolr_with_default_headers.rb` with the following:

```ruby
class RSolrWithDefaultHeaders
  attr_accessor :default_headers

  def initialize(default_headers = {})
    self.default_headers = default_headers
  end

  def connect(opts = {})
    RSolr::Client.new(ConnectionWithDefaultHeaders.new(default_headers), opts)
  end

  class ConnectionWithDefaultHeaders < ::RSolr::Connection
    attr_accessor :default_headers

    def initialize(default_headers)
      self.default_headers = default_headers
    end

    def setup_raw_request_with_default_headers(request_context={})
      setup_raw_request_without_default_headers(request_context).tap do |raw_request|
        default_headers.each do |key,val|
          raw_request[key] = val
        end
      end
    end
    alias_method_chain :setup_raw_request, :default_headers
  end
end

Sunspot::Session.connection_class = RSolrWithDefaultHeaders.new({
  'X-Websolr-Routing' => 'prefer-replica'
})
```

