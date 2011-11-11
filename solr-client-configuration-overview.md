# Solr Client Configuration Overview

Solr presents a HTTP API for your application to use. Configuration in most cases is a simple matter of providing the URL of your Websolr index to your client.

Here we present a quick tour through the bare minimum you need to know to configure various Solr clients.

## Ruby (Ruby on Rails)

### RSolr

```ruby
solr = RSolr.connect url: "http://index.websolr.com/solr/0a1b2c3d4e5f"
```

### Sunspot

Directly in Ruby:

```ruby
Sunspot.config.solr.url = "http://index.websolr.com/solr/0a1b2c3d4e5f"
```

Alternately, in a `config/sunspot.yml` file:

```yml
production:
  solr:
    hostname: index.websolr.com
    port: 80
    path: /solr/0a1b2c3d4e5f
```

### Tanning Bed

```ruby
TanningBed.solr_connection("http://index.websolr.com/solr/0a1b2c3d4e5f")
```

## Python (Django)

### Haystack

```python
HAYSTACK_SOLR_URL = 'http://index.websolr.com/solr/0a1b2c3d4e5f'
```

### solrpy

```python
s = solr.SolrConnection('http://index.websolr.com/solr/0a1b2c3d4e5f')
```

### Sunburnt

```python
solr_interface = sunburnt.SolrInterface("http://index.websolr.com/solr/0a1b2c3d4e5f")
```

### pysolr

```python
conn = Solr('http://index.websolr.com/solr/0a1b2c3d4e5f')
```

## ASP.NET

### SolrNet

```csharp
Startup.Init<Product>("http://localhost:8983/solr");
```

(Where `Product` is your [Solr document mapping class](http://code.google.com/p/solrnet/wiki/Mapping).)

## PHP (Zend, CakePHP, CodeIgniter)

### Apache Solr PHP extension

```php
$options = array (
  'hostname' => 'index.websolr.com',
  'port' => 80,
  'path' => '/solr/0a1b2c3d4e5f'
);
$client = new SolrClient($options);
```

### Pure PHP client

```php
$solr = new Apache_Solr_Service('index.websolr.com', 80, '/solr/0a1b2c3d4e5f');
```

## Java

### SolrJ

```java
SolrServer server = new CommonsHttpSolrServer("http://index.websolr.com/solr/0a1b2c3d4e5f");
```

## Drupal

## Wordpress

[[/system/guides/assets/images/wordpress.png|width=620px|height=276px]]