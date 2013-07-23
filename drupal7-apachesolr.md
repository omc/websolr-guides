# Configuring Drupal 7 with the ApacheSolr module

In this guide, we're going to cover the basics of setting up a websolr index to be used with [Drupal 7](https://drupal.org/drupal-7.22-release-notes) and the [apachesolr](https://drupal.org/project/apachesolr) module. A few points to note before we get started:

- This example uses Drupal 7.22 and ApacheSolr version 7.x-1.3. Your versions may vary; as long as the major versions are the same, you can reliably use this guide.
- This guide is not meant to be an exhaustive tutorial on all of the things the ApacheSolr module can do. The goal here is to get you up and running quickly, then let you tune things as necessary.
- If you run into issues while following this guide, make sure to check the "Troubleshooting" section at the bottom and see if a soluton is addressed there.


## Getting started

For the purposes of this tutorial, I set up a vanilla Drupal 7 install. I used the Devel module to generate 50 nodes of random content so we would have something to index later. After my dummy content was created, I uninstalled and removed this module. I also downloaded the [apachesolr](https://drupal.org/project/apachesolr) module and extracted it to `sites/all/modules/apachesolr` Other than that, I did not add or change any module settings along the way. Your situation is probably different, but it shouldn't matter at this point.

[[https://websolr.com/system/guides/assets/drupal/apachesolr/01 - home.png]]

Make sure you navigate to `admin/modules` and verify that the ApacheSolr module and its related modules have been activated:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/02 - modules.png]]

Great! That's all you need to get started. Next, we'll configure the websolr index that will hold your documents.


## Setting up the websolr index

Next, you'll want to [add a new slice](https://websolr.com/slices/new) to your websolr account. Give your index a descriptive name, select the server group nearest to your application, then select "Drupal ApacheSolr Search 7.x-1.1". Don't worry if the minor versions are different between your system and this tutorial:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/03 - d7-apachesolr-create-index.png]]

When this form has been filled out, go ahead and click "Create." Afterwards, you will be redirected to a page that shows the status of your index and will probably show a message about taking a few minutes to complete:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/04 - d7-apachesolr-create-index-2.png]]

This is usually finished within a few minutes, so take a short break. When you come back, hit refresh to see the following:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/03 - d7-apachesolr-create-index-3.png]]

If you see a message that says your index looks ok, you're done. Occasionally provisioning errors will occur and you will see a message about taking a long time to provision your index. Try appending "/refreshing" to the page's URL and give it a minute or two. If that doesn't clear things up, you will need to open a [support ticket](http://help.websolr.com) and have the Support Team take a closer look.


## Setting up the ApacheSolr

Once your websolr index is up and running, it's time to configure the ApacheSolr module. Navigate to `admin/config/search/apachesolr/settings` and you should see something like this:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/06 - d7-apachesolr-configure-apachesolr.png]]

This is the default setting that comes bundled with the module. Clicking on the "Edit" link will bring up the following form:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/07 - d7-apachesolr-configure-apachesolr-2.png]]

You will want the Solr server URL to point to the URL of the websolr index that you just created. Note that websolr communicates over the standard HTTP port 80, not 8080 or 8983 (standard ports for Tomcat and Jetty respectively). Consequently, you can leave out the port specification and your app will still be able to communicate with websolr. For example, my settings look like this:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/08 - d7-apachesolr-configure-apachesolr-3.png]]

Once you have your URL and a description set up, go ahead and click on "Test connection" to verify that everything is working. You should get a message that your site has contacted the Apache Solr server. If not, check your settings and try again. Once the connection has been verified, click on "Save."

[[https://websolr.com/system/guides/assets/drupal/apachesolr/09 - d7-apachesolr-configure-apachesolr-4.png]]

Next, click on the "Default Index" tab. You will see a few actions for indexing, reindexing and deleting the index. Click on the first one, "Index queued content." This will index a maximum of 50 documents (by default). You could also index all documents at this time, but that may take a while depending on how many documents you have.

[[https://websolr.com/system/guides/assets/drupal/apachesolr/10 - d7-apachesolr-configure-apachesolr-5.png]]

If everything went smoothly, you should get a message like the one below. If you see any errors, double-check that your settings are correct and that the apachesolr module can communicate with websolr:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/11 - d7-apachesolr-configure-apachesolr-6.png]]

Finally, navigate to `admin/config/search/settings` and make sure that the ApacheSolr module is set to the default seach module. You may also want to disable the other modules, especially if you don't need them:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/09a - d7-apachesolr-configure-apachesolr-1.png]]


## Checking on your index

After the apachesolr module has indicated a successful indexing of your documents, you can navigate to your websolr URL and append "/select" to it. This will return the first set of documents in your index. If you don't see them right away after indexing, don't worry. For reasons of network performance and stability, all websolr indices have a 60 second commit time. This means your documents can take up to 60 seconds to show up in your index; if you don't see them right away, just wait a minute, then hit refresh:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/12 - d7-apachesolr-query-results.png]]

To test Drupal, pick out a keyword that you can see in your index. Since my nodes were all random, I grabbed the word "dolor" because it seemed to come up a few times. Go to your Drupal search and enter your chosen keyword. If everything is configured correctly, you should get a set of results:

[[https://websolr.com/system/guides/assets/drupal/apachesolr/13 - d7-apachesolr-query-results-2.png]]


## Troubleshooting

### I get a 401 Unauthorized error when I try to index my documents ###

You have probably enabled authorization on this index. Making changes (writes, updates, deletes) to your index requires that your HMAC key be included in the request header. The ApacheSolr module does not have the capability of crafting a request in this way. There are three solutions: disable advanced authorization, hack the module to include the HMAC header and hard-code your key, or write a patch for the module that adds this cabability for end users and submit it to the maintainer for consideration.