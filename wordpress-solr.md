# Configuring Wordpress with the Solr for Wordpress plugin

In this guide, we're going to cover the basics of setting up a websolr index to be used with [Wordpress](http://wordpress.org/) and the [Solr for Wordpress](http://wordpress.org/plugins/solr-for-wordpress/) plugin. 

IMPORTANT: As of this writing, there is a bug in the Solr for Wordpress plugin. It is a longstanding JavaScript issue which has not been addressed in the past year. This bug is easily fixed, thanks to user ribakker on the [wordpress.org forums](http://wordpress.org/support/topic/plugin-solr-for-wordpress-load-all-posts-not-indexing). If the plugin is not working for you, see the Troubleshooting section at the end of this document.


## Getting started

For the purposes of this tutorial, I set up a vanilla Wordpress install downloaded the [Solr for Wordpress](http://wordpress.org/plugins/solr-for-wordpress/) plugin. Other than that, I did not add or change any settings along the way. Your situation is probably different, but it shouldn't matter at this point.

![Wordpress login](assets/wordpress/solr/Screenshot 1.png)

The first step is to log into your administrative dashboard.

![Wordpress admin dashboard](assets/wordpress/solr/Screenshot 2.png)

Navigate to Plugins > Add New.

![Plugin search](assets/wordpress/solr/Screenshot 3.png)

Search the repository for "Solr for Wordpress." The plugin should be the first one listed. Click "Install Now"

![Installation message](assets/wordpress/solr/Screenshot 4.png)

You may get a screen asking you to fill in your FTP credentials. If so, simply add in the information, or ask your internet provider to tell you what it is. You can also [upload manually](http://codex.wordpress.org/Managing_Plugins#Manual_Plugin_Installation). When the installation has finished, activate the new plugin. Make sure you disable any other search plugins you may be using. 

![Find the Solr options panel](assets/wordpress/solr/Screenshot 5.png)

You can now edit the plugin settings by navigating to Settings > Solr Options


## Setting up the websolr index

Next, you'll want to open up websolr in a new tab and [add a new slice](https://websolr.com/slices/new) to your account. Give your index a descriptive name, select the server group nearest to your application, then select "Solr for Wordpress" for the Index type:

![Create a websolr index](assets/wordpress/solr/Screenshot 5a.png)

When this form has been filled out, go ahead and click "Create." Afterwards, you will be redirected to a page that shows the status of your index and will probably show a message about taking a few minutes to complete:

![Create a websolr index](assets/wordpress/solr/Screenshot 6.png)

The string of random characters at the end of the URL is your index's secret key. It is unique to this index, and is generally referred to as your "websolr key."

If you see a message that says your index looks ok, you're done. Occasionally provisioning errors will occur and you will see a message about taking a long time to provision your index. Try appending "/refreshing" to the page's URL and give it a minute or two. If that doesn't clear things up, you will need to open a [support ticket](http://help.websolr.com) and have the Support Team take a closer look.


## Setting up the Solr for Wordpress plugin

Once your websolr index is up and running, switch back to your Wordpress tab. If you haven't already, navigate to the Solr options page where you should see something like this:

![Solr options page](assets/wordpress/solr/Screenshot 7.png)

To connect your Wordpress site to websolr, you will want to configure a single Solr server, and use the information supplied in the image above. The only difference is the "Solr Path," where you will use your unique 11-character key. Scroll down to the bottom of this page and click "Save Changes." You should now get a "Success!" message:

![Solr options page](assets/wordpress/solr/Screenshot 8.png)

A couple points here. If you click on "Check Server Settings," you will probably get an error that says "Ping failed!" That is not a bug or an indication that anything is wrong. It has to do with the plugin trying to access some administrative functions that websolr blocks for security reason. It will not affect search performance.


## Checking on your index

If you have a plain installation (like me, in this example), go ahead and create a post:

![Create a new post](assets/wordpress/solr/Screenshot 9.png)

Give your post some fun content:

![Create a new post](assets/wordpress/solr/Screenshot 10.png)

Interestingly, when we were evaluating this plugin, we noticed that it generated network traffic to the Solr instance even before the user clicks on "Save" or "Publish." In fact, as of this writing, just giving the post a title is enough to cause the data to be sent to the websolr URL. The document will be updated in the Solr instance whenever the document is autosaved. It's unclear whether this is a bug or a feature, but definitely something to keep in mind.

Once you have published your work, you can navigate to your websolr index and see something like this:

![Create a new post](assets/wordpress/solr/Screenshot 11.png)

If you already have a large number of documents in Wordpress, you can instruct the Solr plugin to synchronize your local database with your websolr index by navigating to Settings > Solr Options and clicking on "Load All Pages," "Load All Posts," then "Optimize Index."

Keep in mind that all indexes on our shared clusters are provisioned with a 60s autoCommit setting. That means it could take up to 60s for your changes to become visible. If you index one or more documents, wait a few minutes before checking to see if they're in your index. Of course, if you have any issues with this, please feel free to open a [support ticket](http://help.websolr.com) and have the Support Team take a closer look.


## Troubleshooting

### Nothing happens when I try to load my posts/pages!

Navigate to Plugins > Editor and select the Solr for Wordpress plugin. In the file solr-for-wordpress.php, you will find a jQuery function like this:

```javascript
$j(document).ready(function() {
    switch1();
    $j('[name=s4w_postload]').click(function() {
        $j(this).after($percentspan);
        disableAll();
        doLoad("post", null);
        $j(this).preventDefault();
    });
    
    $j('[name=s4w_pageload]').click(function() {
        $j(this).after($percentspan);
        disableAll();
        doLoad("page", null);
        $j(this).preventDefault();
    });
});
```

There is something off about the function `preventDefault();`. Change this whole function to:

```javascript
$j(document).ready(function() {
    switch1();
    $j('[name=s4w_postload]').click(function() {
        $j(this).after($percentspan);
        disableAll();
        doLoad("post", null);
        //$j(this).preventDefault();
        return false;
    });
    
    $j('[name=s4w_pageload]').click(function() {
        $j(this).after($percentspan);
        disableAll();
        doLoad("page", null);
        //$j(this).preventDefault();
        return false;
    });
});
```


And that should fix the issue. Special thanks to ribakker on the [wordpress.org forums](http://wordpress.org/support/topic/plugin-solr-for-wordpress-load-all-posts-not-indexing) for taking the time to figure that out.

### I've done everything right, but docs still aren't indexed!

We have found that some web hosts like Rackspace are configured in a way that prevents the Solr for Wordpress module from working correctly. It appears to be related to the `max_exec_time` setting for scripts in PHP.ini on the server side.

This is possibly due to the plugin attempting to index all of the pages/posts simultaneously, which could easily take upwards of 30 seconds (the default value) for even a few hundred documents. Ideally, documents would be sent in batches to avoid this problem, but the plugin doesn't seem to support that yet.

 If your documents are not reaching the index, check to see what the PHP error logs say. Chances are simply increasing the `max_exec_time` variable will fix the issue. 