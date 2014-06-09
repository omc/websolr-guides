---
layout: page
title: Setting up Sunspot for local development
css: index
js: index
---

A common need among developers is a testing environment that matches the production environment. With SaaS, it can be a bit tricky to get a local environment to emulate what is running on production. This guide will help users configure their dev environment to be compatible with websolr.

## First Steps

There are a few preliminary steps you'll need to take:

1. Make sure any local Solr instance is stopped with `bundle exec rake sunspot:solr:stop`. If you set up Solr using something other than rake, kill that process and do not use that method again. Use `ps -ef | egrep "java.*solr"` to identify the pid of any running Solr process and `kill` it.

2. Decide what version of Sunspot and Solr you want to use. As of this writing, the current version of Sunspot is 2.1, and websolr currently uses Solr 3.6.1 and 4.4.0. Granted, you can use whatever versions you like. For example, if you want to use Solr 4.2 instead of 4.4 for some reason, that's fine. The minor versions of Solr are not going to result in different behaviors on your local machine and websolr.

3. Check that you have the necessary gems with `bundle show`. You should see something like:

```
  * sunspot (2.1.0)
  * sunspot_rails (2.1.0)
  * sunspot_solr (2.1.0)
```

If not, add these to your Gemfile:

```ruby
gem 'sunspot', '~> 2.1.0'
gem 'sunspot_rails', '~> 2.1.0'
gem 'sunspot_solr', '~> 2.1.0'
```

and run `bundle install`

4. Run `bundle exec rake sunspot:solr:start` to start up a local Solr server, and `ps -ef | egrep "(java.*solr)" | grep -v 'egrep' | sed -r 's/.*port\=([0-9]{1,}).*/SOLR RUNNING ON PORT: \1/'` to find out what port it's running on. This will probably be 8982, but it could be something else.

5. Navigate to http://localhost:8982/solr (substitute the port you found in step 4 for 8982 if needed). This will bring up the Solr dashboard. If everything looks good, you've completed all of the preliminary steps.


## Getting the version of Sunspot you want

Using a specific version of Sunspot is easy with Rails. Simply set the [version number](https://rubygems.org/gems/sunspot/versions) in your Gemfile like so:

```ruby
gem 'sunspot', '~> 2.1.0'
```

You can also configure your client to use the most up to date version with:

```ruby
gem 'sunspot', :git => 'git://github.com/sunspot/sunspot.git'
```

Note that adding the Sunspot gem will also add the sunspot_rails and sunspot_solr gems, and all will share the same version. **The dependancies must match the version of the sunspot gem!** If they do not, you will get an error. For example, if you try to use Sunspot 2.1 and sunspot-rails 2.0.0, there will be a version conflict and bundler will give you an error.


## Getting the version of Solr you want

This section involves specifying the version of the local Solr instance that will be created when you run `bundle exec rake sunspot:solr:start`.

1. Make sure Solr is stopped with `bundle exec rake sunspot:solr:stop`. Use `ps -ef | egrep "java.*solr"` to identify the pid of any other running Solr process and `kill` it (there shouldn't be any -- if there are, go through the previous section again).

2. Move to where the sunspot_solr gem is installed via `cd $(bundle show sunspot_solr)` and back up the solr directory: `mv solr solr.bak`.

3. Now, in this directory, you'll want to download a zip or tarball of the Solr version you want. You can find a repository of all versions of Solr at [Apache.org](http://archive.apache.org/dist/lucene/solr/). In this example, we're going to set up Solr 4.4 in Sunspot, which can be found [here](http://archive.apache.org/dist/lucene/solr/4.4.0/).

4. Extract the contents and copy the "example" directory to the current directory (where the sunspot_solr gem is located). This example, that would be `cp -rf solr-4.1.0/example solr`

5. Move back to your project's root folder and look for a folder called "solr." If you see one, back it up with `mv solr solr.bak`; if you don't see one, that's fine. Start up the Solr instance using `bundle exec rake sunspot:solr:start`, which should create a fresh "solr" folder in your project root.

6. Check the port on which Solr is running with `ps -ef | egrep "(java.*solr)" | grep -v 'egrep' | sed -r 's/.*port\=([0-9]{1,}).*/SOLR RUNNING ON PORT: \1/'`, then visit the dashboard at http://localhost:8982/solr/ (or whatever port was indicated)

7. In the dashboard, look for the line `solr-spec`; it should indicate that you're running 4.4.0 (or whatever version you got from Lucene). Once you have confirmed it is the correct version, stop the server again `bundle exec rake sunspot:solr:stop`

8. You will need to make sure your configuration files all match what you see on websolr. Move into the "solr" directory with `cd solr`.

9. If you list the files in this directory, you will see a file called solr.xml. This file defines all of your cores. It should look something like this:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<solr persistent="false">
  <cores adminPath="/admin/cores" host="${host:}" hostPort="${jetty.port:}">
    <core name="default"     instanceDir="." dataDir="default/data"/>
    <core name="development" instanceDir="." dataDir="development/data"/>
    <core name="test"        instanceDir="." dataDir="test/data"/>
  </cores>
</solr>
```

You can add/remove and rename cores as you like. It would probably be a good idea to rename them to whatever your websolr cores are named. A websolr core is the 11 character alphanumeric string in your websolr URL. So if your websolr URL is http://index.websolr.com/solr/a1b2c3d4e5f, then your core is named a1b2c3d4e5f. If you have two cores, let's say a1b2c3d4e5f and f5e4d3c2b1a, you could change this file to:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<solr persistent="false">
  <cores adminPath="/admin/cores" host="${host:}" hostPort="${jetty.port:}">
    <core name="a1b2c3d4e5f"     instanceDir="." dataDir="a1b2c3d4e5f/data"/>
    <core name="f5e4d3c2b1a" instanceDir="." dataDir="a1b2c3d4e5f/data"/>
  </cores>
</solr>
```

10. Go into the "conf" directory with `cd conf` and make sure your schema.xml and solrconfig.xml match what is on file with websolr (email us if you need a copy of anything). Note that websolr only supports the following files:

- solrconfig.xml
- schema.xml
- synonyms.txt
- stopwords.txt
- protwords.txt
- elevate.xml
- mapping-ISOLatin1Accent.txt

So if you are using additional files locally to add extra features to your index, be aware, that this will not be supported on websolr.

11. When everything is confirmed to match, go ahead and navigate back to your project's root directory with `cd ../..`. Then fire up Solr again: `bundle exec rake sunspot:solr:start` You can check to see if your core name(s) have taken effect via your web browser: http://localhost:8982/solr/<core_name>/select. Note: the index should appear empty because it is new and nothing has been indexed to it yet.


## Configure Sunspot

Before you can complete the process, you will need to configure Sunspot to talk to your local Solr instance. Open up the file `config/sunspot.yml` and take a look. A suggested configuration is something like this:

```yaml
production:
  solr:
    path: /solr/a1b2c3d4e5f
    hostname: index.websolr.com
    port: 80
    log_level: WARNING
    # read_timeout: 2
    # open_timeout: 0.5

development:
  solr:
    path: /solr/f5e4d3c2b1a
    hostname: localhost
    port: 8982
    log_level: INFO
```

When you're running in production, Sunspot is configured to connect to your websolr index over port 80. In development, it will connect to your local Solr instance over 8982. You'll obviously need to tweak these values for your particular needs. 


## Bringing it all together

Now that you have the desired versions of Sunspot and Solr up and running, you'll need to index your documents to populate the index(es) you configured in the previous step. Run `bundle exec rake sunspot:solr:reindex` to have Sunspot index your documents to Solr. If you don't get any error messages, you should be set. You can use your web browser to see the results: `http://localhost:8982/solr/<core_name>/select`


## Troubleshooting

If you get an error while indexing or do not see any results afterwards, don't panic. First, check your solrconfig.xml for a setting called `autoCommit`. There should be a subsetting called `maxTime` with a number. This number is the number of milliseconds Solr should wait before committing updates to the index. By default, this is usually 60000, or 60s. If your results aren't showing up right away, give it a minute and check again. If they show up after a minute or so, feel free to change this setting to something like 5000 (which is 5s) to reduce the amount of time you need to wait for documents to show up.

If that doesn't work, confirm the settings in your sunspot.yml. Are you indexing to the right host, port and core?

You can also try some network inspection with `socat`. Change the port configured in your sunspot.yml to something like 1234 and run socat:

`socat -v TCP-LISTEN:1234,fork TCP:localhost:8982 &> data.log &`

Make sure you replace 8982 with whatever port your local Solr instance is running on. This command will record traffic sent to localhost:1234 and then pass it along to localhost:8982, logging everything to data.log. Re-run `bundle exec rake sunspot:solr:reindex` to populate the data.log file. Reading through it should show you everything that Sunspot sent to Solr and what Solr's response was.

If none of this gets you anywhere, please feel free to shoot us a [support ticket](http://help.websolr.com).