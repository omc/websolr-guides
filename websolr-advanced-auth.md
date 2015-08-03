# Websolr Advanced Auth

Websolr features per-request authorization for requests made to your Solr
index.  This feature is perfect for anyone who needs to guarantee complete
cyptographically secure access to their index -- or for anyone who wishes to
expose their Solr URL for public read-only access while still protecting
updates.

Websolr advanced authorization is an opt-in feature. Upon enabling this feature
for your index you will be issued a secret token (herein called SECRET). This
token is used with the HMAC-SHA1 algorithm as described below.

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

## Setting your URL

We recommend setting your URL as an environment variable rather than hardcoding it into the app for security reasons. Heroku users will already have a `WEBSOLR_URL` environment variable set up, and users of other platforms/frameworks should set one up as well. If you're not on Heroku, then something like this should work:

```
$ export WEBSOLR_URL="<the URL for your index>"
```

Websolr uses standard ports for communicating with an index, so we don't explicitly set those in the URL by default. Most clients can infer the correct port based on the protocol. However, some clients will default to port 80 unless instructed otherwise. This can lead to connectivity problems if the app tries to contact the index over port 80 using TLS/SSL. If you have trouble with this, feel free to set the port manually. We're using:

* 443 for HTTPS (TLS/SSL) protocol. This provides end-to-end encryption during data transmission.
* 80 for HTTP protocol. This is for plaintext data transmission (not recommending if you're following this guide)

Some examples of valid URLs:

```
# Plaintext:
$ export WEBSOLR_URL="http://index.websolr.com/solr/a1b2c3d4e5f"
$ export WEBSOLR_URL="http://index.websolr.com:80/solr/a1b2c3d4e5f"

# Encrypted
$ export WEBSOLR_URL="https://index.websolr.com/solr/a1b2c3d4e5f"
$ export WEBSOLR_URL="https://index.websolr.com:443/solr/a1b2c3d4e5f"
```

Some **invalid** URLs:

```
$ export WEBSOLR_URL="http://index.websolr.com:443/solr/a1b2c3d4e5f"
$ export WEBSOLR_URL="https://index.websolr.com:80/solr/a1b2c3d4e5f"
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
    'X-Websolr-Time'  => time.to_s,
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
