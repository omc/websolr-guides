* [[Solr Clients]] - [[RSolr]]
* [[Solr Features]] - [[TermsComponent]]

## TermsComponent basics

TermsComponent bases its responses on the contents of a field which you specify. This can be a specific field, 

If you use [[dynamic field naming conventions]], you could also copy all of your text fields into a single text field.

```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <schema>
    <types>
      
      <fieldType name="text">
        <!-- ... -->
      </fieldType>
      
      <!-- ... -->
      
    </types>
    <fields>
      
      <!-- ... -->
      
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