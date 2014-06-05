---
layout: page
title: Solr Client Configuration Overview
css: index
js: index
---

Solr presents a HTTP API for your application to use. Configuration in most cases is a simple matter of providing the URL of your Websolr index to your client.

Here we present a quick tour through the bare minimum you need to know to configure various Solr clients.

## Ruby (Ruby on Rails)

### RSolr

{% highlight ruby %}
solr = RSolr.connect url: "http://index.websolr.com/solr/0a1b2c3d4e5f"
{% endhighlight %}

### Sunspot

Directly in Ruby:

{% highlight ruby %}
Sunspot.config.solr.url = "http://index.websolr.com/solr/0a1b2c3d4e5f"
{% endhighlight %}

Alternately, in a `config/sunspot.yml` file:

{% highlight yaml %}
production:
  solr:
    hostname: index.websolr.com
    port: 80
    path: /solr/0a1b2c3d4e5f
{% endhighlight %}

### Tanning Bed

{% highlight ruby %}
TanningBed.solr_connection("http://index.websolr.com/solr/0a1b2c3d4e5f")
{% endhighlight %}

## Python (Django)

### Haystack

{% highlight python %}
HAYSTACK_SOLR_URL = 'http://index.websolr.com/solr/0a1b2c3d4e5f'
{% endhighlight %}

### solrpy

{% highlight python %}
s = solr.SolrConnection('http://index.websolr.com/solr/0a1b2c3d4e5f')
{% endhighlight %}

### Sunburnt

{% highlight python %}
solr_interface = sunburnt.SolrInterface("http://index.websolr.com/solr/0a1b2c3d4e5f")
{% endhighlight %}

### pysolr

{% highlight python %}
conn = Solr('http://index.websolr.com/solr/0a1b2c3d4e5f')
{% endhighlight %}

## ASP.NET

### SolrNet

{% highlight csharp %}
Startup.Init<Product>("http://index.websolr.com/solr/0a1b2c3d4e5f");
{% endhighlight %}

(Where `Product` is your [Solr document mapping class](http://code.google.com/p/solrnet/wiki/Mapping).)

## PHP (Zend, CakePHP, CodeIgniter)

### Apache Solr PHP extension

{% highlight php %}
$options = array (
  'hostname' => 'index.websolr.com',
  'port' => 80,
  'path' => '/solr/0a1b2c3d4e5f'
);
$client = new SolrClient($options);
{% endhighlight %}

### Pure PHP client

{% highlight php %}
$solr = new Apache_Solr_Service('index.websolr.com', 80, '/solr/0a1b2c3d4e5f');
{% endhighlight %}

## Java

### SolrJ

{% highlight java %}
SolrServer server = new CommonsHttpSolrServer("http://index.websolr.com/solr/0a1b2c3d4e5f");
{% endhighlight %}

## Wordpress

Please see our detailed guide to [Wordpress with websolr](/guides/wordpress)

## Drupal

Please see our detailed guide to [Drupal Apachesolr module with websolr](/guides/drupal/drupal7-apachesolr.html), or [Drupal Search API Solr module](/guides/drupal/drupal7-searchapisolr.html), as appropriate.