# WanadevProjectManager: SerializableClass

`SerializedClass` is an [abitbol][] class that can serialize its properties. Features:

* Serialize/Unserialize all computed properties that have a getter and a setter,
* Skip properties annotatated with `"@serializable false"`.
* Use custom serialization function for specific properties.

Example:

```javascript
var SerializableClass = require("wanadev-project-manager/lib/SerializableClass");

var Demo = SerializableClass.$extend({
    __name__: "Demo",                     // Must be set to the class name

    __init__: function(params) {          // The constructor takes an object containing values for computed properties (optional)
        this.$data.foo = "bar";           // Default values for computed properties
        this.$super(params);              // Call the super constructor to apply given values
        ...                               // Any other initialization code you need
    },

    getMyProp: function() {               // this.myProp: serialized propery (getter + setter)
        return this.$data.myProp;
    },

    setMyProp: function(value) {
        this.$data.myProp = value;
    },

    getMyProp2: function() {              // this.myProp2: not serialized (no setter)
        return this.$data.myProp2;
    },

    getMyProp3: function() {              // this.myProp3: not serialized (annotated with "@serializable false")
        "@serializable false";
        return this.$data.myProp3;
    },

    setMyProp3: function(value) {
        this.$data.myProp3 = value;
    }
});

SerializableClass.$register(Demo);        // Register the class (allows automatic unserialization)
```


## Serialization / Unserialization

### Unserialization

To Unserialize, you can use the constructor:

```javascript
    var demo = new Demo({
        ...  // your data
    });
```

or the `unserialize()` method:

```javascript
var demo = new Demo();
demo.unserialize({
    ...  // your data
});
```

__NOTE:__ There is also a `SerializableClass.$unserialize()` static method that can unserialize any registered `SerializableClass`.


### Serialization

To serialize, just call the `serialize()` method:

```javascript
var data = demo.serialize();
```


### Custom Serializers

If your class contains serializable properties that are not built-in types (`String`, `Number`, `Boolean`, `Object` and `Array`),
you have to define custom serialization / unserialization functions:

```javascript
SerializableClass.$addSerializer("serializerName", {
    class: YourClass,                      // not required if you only use the `@serializer` annotation
    serialize: function(data) {
        // ...
        return serializedData;
    },
    unserialize: function(data) {
        // ...
        return unserializedData;
    }
});
```

And then you can annotates all properties that will require your custom serializer (if you defined a class in the serializer, this is not required):

```javascript
getFoobar: function() {
    "@serializer serializerName";
    // ...
},

setFoobar: function(value) {
    // ...
}
```


## Clone

To clone a class, just call the `clone` method of the class;


## Trouble shooting

* Check your class have its `__name__` attribute defined to something unique
* Check you have registered your class with `SerializableClass.$register(YourClass)`
* Check you have no circular references into your classes


[abitbol]: https://github.com/wanadev/abitbol
