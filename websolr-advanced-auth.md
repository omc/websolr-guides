# Websolr Advanced Auth

Websolr features per-request authorization for requests made to your Solr
index.  This feature is perfect for anyone who needs to guarantee complete
cyptographically secure access to their index -- or for anyone who wishes to
expose their Solr URL for public read-only access while still protecting
updates.

Websolr advanced authorization is an opt-in feature. Upon enabling this feature
for your index you will be issued a secret token (herein called SECRET). This
token is used with the HMAC-SHA1 algorithm as described below.

## What's this app for?

This application is provided as a working sample to demonstrate how Websolr
authorization works. You may fork it and use it as a starting point for your
own applications as you like. We also welcome forks to help us duplicate any
errors that may be discovered.

## Installing & running

To install and use the sample app locally and demonstrate that its calls to
Solr work you should run the following:

```
export WEBSOLR_URL='your-index-url'
export WEBSOLR_AUTH='your-index-auth-secret'

git clone git://github.com/nz/websolr-demo-advanced-auth.git
cd websolr-advanced-auth

bundle install
bundle exec rake db:seed

bundle exec rails server
open http://localhost:300/
```

## Authorization scheme

The authorization scheme works by including three additional HTTP headers with
each request to Solr:

### X-Websolr-Time

The current Unix time -- seconds since epoch. This value helps to guarantee
uniquness over time, and must be within one minute of our server time to prevent
replay attacks.  (Regex: `/[0-9]+/`)

### X-Websolr-Nonce

Any random non-whitespace string. This value further guarantees the uniqueness
of each generated authorization token. (Regex: `/\S+/`)

### X-Websolr-Auth

The hexadecimal HMAC-SHA1 digest of your shared secret and the concatenation of
the above **time** and **nonce**.

For example, in Ruby:

```ruby
OpenSSL::HMAC.hexdigest('sha1', SECRET, "#{time}#{nonce}")
```

## Example with RSolr

```ruby
require 'rsolr'
rsolr = RSolr.connect :url => ENV['WEBSOLR_URL']

def auth_headers(secret=ENV['WEBSOLR_AUTH'])
  time  = Time.now.to_i
  nonce = Time.now.to_i.to_s.split(//).sort_by{rand}.join
  auth  = OpenSSL::HMAC.hexdigest('sha1', secret, "#{time}#{nonce}")
  {
    'X-Websolr-Time'  => time,
    'X-Websolr-Nonce' => nonce,
    'X-Websolr-Auth'  => auth
  }
end

# Add a document
rsolr.add { :id => 1, :title => "Hello world" }, { :headers => auth_headers }

# Commit
rsolr.commit :headers => auth_headers

# Search
rsolr.get 'select', :params => { :q => "hello" }, :headers => auth_headers

```
