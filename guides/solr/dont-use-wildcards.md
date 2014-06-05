---
layout: page
title: Why should I avoid wildcards in Solr?
css: index
js: index
---

In this guide, we're going to cover how Solr implements pattern matching with wildcards, how Solr's wildcards differ from other implementations like SQL and bash, and why it should generally be avoided.

## Wildcards in Solr

Solr supports two types of wildcards: `*` and `?`. The `*` symbol means "anything" while the `?` symbol means "any character." The difference is that `*` can match multiple characters, while `?` will only match one. For example:

* "c*t" matches "cat", "cult", "count"
* "c?t" matches "cat", "cot", "cut"

A common "gotcha" with these wildcards is that the `*` symbol can match any number of terms, or no terms at all, while the `?` can match only one term. For example:

* "a*t" matches "at", "ant"
* "a?t" matches "ant", does not match "at"

Another common "gotcha" with wildcards is that **queries with wildcards are not analyzed**. Often developers will create an analyzer on a fieldType that treats text a certain way, then are furstrated when wildcard queries are treated differently. This is the normal behavior. 

### How these wildcards work

Solr is able to deliver lightening fast results by employing a data structure known as an inverted index. This operates much like the index in the back of a book; the reader finds a word, and the index tells him or her on which pages that term can be found. Similarly, a Solr index maps a given term to a list of documents that contain that term.

Let's say there are 3 documents with some text in a given field, called `content`: 

* Doc 1: "What is this?"
* Doc 2: "This is a cat."
* Doc 3: "What is a cat?"

Solr would index this by creating an inverted index mapping each term to the ID(s) of the document that contain it:

{% highlight text %}
a      =>  2,3
cat    =>  2,3
is     =>  1,2,3
this   =>  1,2
what   =>  1,3
{% endhighlight %}

So if a user queries the term "cat," Solr doesn't need to check every document for the term. Rather, it just needs to find the term in the dictionary and figure out to which documents it is mapped. Since the term dictionary is alphabetically ordered, the process is relatively quick and easy.

Now, let's consider a slightly more realistic dictionary. An index with even a few dozen documents may have hundreds of terms in the dictionary, so let's consider one with the following segment:

{% highlight text %}
...
brow    =>  2,3,4,7,9
cap     =>  1,3,6
capsize =>  2,6,8
captain =>  2,3,5,7
cat     =>  2,3,4,7,8,9
clap    =>  1,2,3,4
clip    =>  4,5,7,9
clipped =>  2,3,4,6
clog    =>  5,6,8
clown   =>  2,3,5
cup     =>  3,4,6,7
dog     =>  1,4,5,8
...
{% endhighlight %}

Now, if we issue a query like `q=ca*`, Solr will traverse the dictionary until it reaches the "C" section, where it will then look at the first word: "cap." Solr essentially follows this thought process:

> Does "ca*" match "cap"? Their first character is 'c,' which matches, so I'll go to the next character. The next character character is 'a,' which matches, so I'll go to the next character. 

> Hmmm... For the query, that's a `*`, followed by the null character, which means I'm now searching the term for a string of arbitrary length, followed by the null character. The next character of the term 'cap' is a 'p.' 'p' is a string of arbitrary length, so that matches. Is it followed by a null character? Yes! There is nothing else to compare, and everything has matched. Thus, 'ca*' matches 'cap;' I'll go ahead and store documents 1,3 and 6 into memory and go on to the next word.

> Next word in the dictionary: "capsize." The first character matches. The second character matches. Now I'm trying to find another string of arbitrary length followed by the null character. The third character of "capsize" is 'p;' is the next character null? Nope, it's 's.' Oh well, 'ps' is still a string of arbitrary length. Is the next character null? Nope, it's 'i.' Is the next character null? Nope, it's 'z.' Is the next character null? Nope, it's 'e.' Is the next character null? Yes! 'psize' is a null-terminated string of arbitrary length, so it matches `*`. Thus, "ca*" matches "capsize". I'll store documents 2, 6 and 8 into memory.

>  Oh look, I just read over the documents already in memory and found that document 6 is already included. I'll make sure it's only included once. Okay, now my document list is 1, 2, 6 and 8. Moving on to the next word...

Solr will continue in this fashion until it has exhausted all of the entries in the "C" section of the dictionary. 

As a human looking at the dictionary, it's immediately obvious that only 4 terms should be included: "cap," "capsize," "captain," and "cat." However, the computer doesn't see things the same way; it's not immediately obvious to Solr which words should be returned, and the software runs through a complicated algorithm to determine if a word should or shouldn't be included in the results.

Consequently, Solr had to perform 12 comparisons to identify two results. It would need another 12 to identify the other two results. In other words, Solr would need to perform 24 comparisons on the 4 matching words alone. This is extremely inefficient compared to other methods.


### Leading wildcards

Due to the way Solr handles wildcards, the developers of Lucene and Solr had the sense to disable leading wildcards by default. If it wasn't obvious from the preceeding example, starting a search with a wildcard is quite possibly the worst thing you can do from a performance standpoint. Rather than jumping to a specific location in the terms dictionary, Solr would need to simply start at the beginning of the dictionary and iterate over every term looking for a pattern, which would mean hundreds of thousands (if not millions) of comparison operations to match a handful of results.

For example, assume the dictionary from the preceding example represents the entirety of an index's content. A query like "*p" would require 62 comparisons to return 4 correct results. That may not seem like a serious problem for a computer (Solr would be able to handle a job like that in a millisecond), but consider the consequences of geometric expansion. That is, as an index grows to tens of thousands or millions of documents, its term dictionary will grow accordingly. The number of comparisons that would need to be made to yield the full set of results could number in the tens or hundreds of millions and require substantial RAM and CPU power.

Leading wildcards are disabled by default for this reason; it saves resources and encourages developers to find a better way to search. However, if your application absolutely requires it (and you're willing to pay for the performance hit). Additionally, as of Solr 1.4+, there is now a reverse wildcards feature to work around these performance problems.

Adding the `ReversedWildcardFilterFactory` filter to the end of an analyzer chain in your schema.xml will allow that field to support leading wildcards by reversing the order in which character comparisons occur.


## NGrams as an alternative

Imagine breaking a word up in to fragments or blocks. For example, the word "antique" could be broken into "ant," "anti," "antiq," "antiqu" and "antique". Those fragments are called "grams". See our article [What are "grams" in Solr?](what-are-grams.html) for more detailed information.

Consider our example terms dictionary again:

{% highlight text %}
...
brow    =>  2,3,4,7,9
cap     =>  1,3,6
capsize =>  2,6,8
captain =>  2,3,5,7
cat     =>  2,3,4,7,8,9
clap    =>  1,2,3,4
clip    =>  4,5,7,9
clipped =>  2,3,4,6
clog    =>  5,6,8
clown   =>  2,3,5
cup     =>  3,4,6,7
dog     =>  1,4,5,8
...
{% endhighlight %}

With EdgeNGrams and a minimum gram size of 2, this would look more like:

{% highlight text %}
...
br      =>  2,3,4,7,9
bro     =>  2,3,4,7,9
brow    =>  2,3,4,7,9
ca      =>  1,2,3,4,5,6,7,8,9
cap     =>  1,2,3,6,8
caps    =>  2,6,8
capsi   =>  2,6,8
capsiz  =>  2,6,8
capsize =>  2,6,8
capt    =>  2,3,5,7
capta   =>  2,3,5,7
captai  =>  2,3,5,7
captain =>  2,3,5,7
cat     =>  2,3,4,7,8,9
cl      =>  1,2,3,4,5,6,7,8,9
cla     =>  1,2,3,4
clap    =>  1,2,3,4
cli     =>  4,5,7,9
clip    =>  2,3,4,5,6,7,9
clipp   =>  2,3,4,6
clippe  =>  2,3,4,6
clipped =>  2,3,4,6
clo     =>  2,3,5,6,8
clog    =>  5,6,8
clow    =>  2,3,5
clown   =>  2,3,5
cu      =>  3,4,6,7
cup     =>  3,4,6,7
do      =>  1,4,5,8
dog     =>  1,4,5,8
...
{% endhighlight %}

The immediate difference is that the dictionary is much longer. The original 12 lines has ballooned into 30 lines, which is an increase of 150%. However, this size difference is compensated by the fact that searching for partial terms is now incredibly fast. Now, searching for "ca" (without the trailing wildcard) returns the entire set of matching documents with a single comparison operation, or in 1/24th the amount of time it would take a wildcard to traverse the non-NGram term dictionary. 