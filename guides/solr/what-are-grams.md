---
layout: page
title: What are "grams" in Solr?
css: index
js: index
---

There are certain use cases in Solr in which a user may want to search for fragments of a term instead of the whole term. For example, most [autocomplete]() applications would want a search term like "Ninj" to match a result like "Ninja Turtles." This is where grams are useful; without them, a query like "Ninj" would be unlikely to match any documents. But by breaking terms into fragments in an inverted index like Solr, users can query for parts of a term and get relatively meaningful results.


## EdgeNGrams

EdgeNGrams are perhaps the most common and easily-understood. Essentially, a word is broken into a certain number of grams *starting from one end*. So, for example, the word "locomotive" might be broken up like this:

`"locomotive" => "l", "lo", "loc", "loco", "locom", "locomo", "locomot", "locomoti", "locomotiv", "locomotive"`

This behavior can be changed by specifying the end of the word from which to start, and the max and min gram size (number of characters) in the fieldType definition. 


## NGrams

NGrams are a more general type of grams than EdgeNGrams. Whereas EdgeNGrams break a word into fragments starting from one edge, NGrams will break a word into fragments  without regard to one side or another. For example, if we have a word like "locomotive," with a minimum gram size of 3 and a maximum gram size of, say, 15, then it would will break it down like:

{% highlight text %}
loc, oco, com, omo, mot, oti, tiv, ive,
loco, ocom, como, omot, moti, otiv, tive,
locom, ocomo, comot, omoti, motiv, otive,
locomo, ocomot, comoti, omotiv, motive,
locomot, ocomoti, comotiv, omotive,
locomoti, ocomotiv, comotive
locomotiv, ocomotive,
locomotive
{% endhighlight %}

NGrams of this type are especially useful if your use case requires partial word matching. That is, if a user searches for "motive", then this approach would match documents containing the term "locomotive." 


## Usage in Solr

Solr can use grams in one of two ways. Most commonly, grams are employed as filters acting on a token stream, but Solr does provide a method to tokenize by grams as well.

To elaborate, when Solr is receiving a stream of text, either for the purposes of searching or for indexing, the stream can be manipulated in various ways in order to achieve some certain behavior. For example, in a fieldType definition within a schema, you will typically see something like this:

{% highlight xml %}
<fieldType name="some_name" class="solr.SomeFieldType" someoptions="yeah" >
   <analyzer>
      <tokenizer class="solr.SomeTokenizerFactory"/>
      <filter class="solr.SomeFilterFactory1" someoptions="usually" />
      <filter class="solr.SomeFilterFactory2" someoptions="usually" />
      <filter class="solr.SomeFilterFactory3" someoptions="usually" />
   </analyzer>
</fieldType>
{% endhighlight %}

The [tokenizer](http://en.wikipedia.org/wiki/Tokenization) splits up the incoming text stream into "tokens," which are then acted upon in sequence by the filters. Consider the phrase "The Quick Brown Fox Jumps Over The Lazy Dog"; if we pass this text stream through an analyzer like this:

{% highlight xml %}
<analyzer>
  <!-- Split on whitespace -->
  <tokenizer class="solr.WhitespaceTokenizerFactory"/>

  <!-- Convert to lowercase -->
  <filter class="solr.LowerCaseFilterFactory" />

  <!-- Remove tokens where length is not 2 to 4 characters -->
  <filter class="solr.LengthFilterFactory" min="2" max="4" />
</analyzer>
{% endhighlight %}

the stream becomes: "the", "fox", "over", "the", "lazy", "dog".

The takeaway here is that analyzers can only have a single tokenizer, but an arbitrary number of filters. However, those filters will act on the tokens in sequence, which means if you have multiple filters in use, the end result may not be what you expect. It's important to understand this to be able to use grams correctly, particularly if your use case involves autocomplete.

Let's take a look at how Solr uses grams, both as filters and as tokenizers:


### NGramFilterFactory

**Options:**

* minGramSize (default = 1)
* maxGramSize (default = 1)

{% highlight xml %}
<fieldType name="text" class="solr.TextField" positionIncrementGap="100">
   <analyzer>
      <tokenizer class="solr.LowerCaseTokenizerFactory"/>
      <filter class="solr.NGramFilterFactory" minGramSize="2" maxGramSize="5" />
   </analyzer>
</fieldType>
{% endhighlight %}

Note: With a configuration like this, the token "locomotive" would filtered to:

{% highlight text %}
lo, oc, co, om, mo, ot, ti, iv, ve
loc, oco, com, omo, mot, oti, tiv, ive
loco, ocom, como, omot, moti, otiv, tive
locom, ocomo, comot, omoti, motiv, otive
{% endhighlight %}


### NGramTokenizerFactory

**Options:**

* minGramSize (default = 1)
* maxGramSize (default = 1)

{% highlight xml %}
<fieldType name="text" class="solr.TextField" positionIncrementGap="100">
   <analyzer>
      <tokenizer class="solr.NGramTokenizerFactory" minGramSize="2" maxGramSize="5"/>
   </analyzer>
</fieldType>
{% endhighlight %}

Note: With a configuration like this, the word "locomotive" would tokenized as:

{% highlight text %}
lo, oc, co, om, mo, ot, ti, iv, ve
loc, oco, com, omo, mot, oti, tiv, ive
loco, ocom, como, omot, moti, otiv, tive
locom, ocomo, comot, omoti, motiv, otive
{% endhighlight %}


### EdgeNGramFilterFactory

**Options:**

* minGramSize (default = 1)
* maxGramSize (default = 1)
* side (default = "front")

{% highlight xml %}
<fieldType name="text" class="solr.TextField" positionIncrementGap="100">
   <analyzer>
      <tokenizer class="solr.LowerCaseTokenizerFactory"/>
      <filter class="solr.EdgeNGramFilterFactory" minGramSize="3" maxGramSize="7" side="back"/>
   </analyzer>
</fieldType>
{% endhighlight %}

Note: With a configuration like this, the token "locomotive" would be filtered to:

`"locomotive" => "ive", "tive", "otive", "motive", "omotive"`


### EdgeNGramTokenizerFactory

**Options:**

* minGramSize (default = 1)
* maxGramSize (default = 1)
* side (default = "front")

{% highlight xml %}
<fieldType name="text" class="solr.TextField" positionIncrementGap="100">
   <analyzer>
      <tokenizer class="solr.EdgeNGramTokenizerFactory" minGramSize="2" maxGramSize="5" side="back"/>
   </analyzer>
</fieldType>
{% endhighlight %}

Note: With a configuration like this, the word "locomotive" would tokenized as:

`"locomotive" => "ve", ive", "tive", "otive"`


