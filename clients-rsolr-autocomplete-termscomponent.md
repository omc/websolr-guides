# Search Autocomplete with Solr TermsComponent and RSolr

## Quick start

If you're already familiar with the basics and just looking for some sample code, here you go!

```ruby
rsolr = RSolr.connect :url => 'http://index.websolr.com/solr/0a1b2c3d4e5f'
rsolr.get 'terms', :params => { 'terms.fl' => '', 'terms.prefix' => '' }
# ...
```

## TermsComponent basics

TermsComponent bases its responses on the contents of a field which you specify. This can be a specific field, 

If you use [[dynamic field naming conventions]], you could also copy all of your text fields into a single text field.

```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <schema>
    <types>
      
      <fieldType name="text" class="solr.TextField">
        <!-- the rest of your definition for a typical text field goes here -->
      </fieldType>
      
      <!-- other field types omitted for brevity -->
      
    </types>
    <fields>
      
      <!-- other fields omitted for brevity -->
      
      <field name="*_text" type="text" indexed="true" stored="false" multiValued="true" />
      <field name="allText" type="text" indexed="true" stored="false" multiValued="true" />
      
    </fields>
    
    <!--
      Copy each of the text fields into allText for use by TermsComponent,
      SpellcheckComponent, and others.
    -->
    <copyField source="*_text" dest="allText"/>
    
  </schema>
```

## Interacting with TermsComponent

```ruby
rsolr = RSolr.connect :url => 'http://index.websolr.com/solr/0a1b2c3d4e5f'
rsolr.get 'terms', :params => { 'terms.fl' => '', 'terms.prefix' => '' }
```

asdf