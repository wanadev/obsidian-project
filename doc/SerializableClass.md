# WanadevProjectManager: SerializableClass

`SerializedClass` is an [abitbol][] class that can serialize its properties. Features:

* Serialize/Unserialize all computed properties that have a getter and a setter,
* Skip properties annotatated with `"@serializable false"`.
* Use custom serialization function for specific properties.

Example:

    var SerializableClass = require("SerializableClass");

    var Demo = SerializableClass.$extend({
        __name__: "Demo",                     // Must be set to the class name

        __init__: function(params) {          // The constructor takes an object containing values for computed properties (optional)
            this.$data = {};                  // Default values for computed properties
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


## Serialization / Unserialization

### Unserialization

To Unserialize, you can use the constructor:

    var demo = new Demo({
        ...  // your data
    });

or the `unserialize()` method:

    var demo = new Demo();
    demo.unserialize({
        ...  // your data
    });

__NOTE:__ There is also a `SerializableClass.$unserialize()` static method that can unserialize any registered `SerializableClass`.


### Serialization

To serialize, just call the `serialize()` method:

    var data = demo.serialize();


### Custom Serializers

If your class contains serializable properties that are not built-in types (`String`, `Number`, `Boolean`, `Object` and `Array`),
you have to define custom serialization / unserialization functions:

    SerializableClass.$addSerializer("serializerName", {
        serialize: function(data) {
            // ...
            return serializedData;
        },
        unserialize: function(data) {
            // ...
            return unserializedData;
        }
    });

And then you have to annotates all properties that will require your custom serializer:

    getFoobar: function() {
        "@serializer serializerName";
        // ...
    },

    setFoobar: function(value) {
        // ...
    }

__NOTE:__ There is a built in serializer for `SerializableClass`. to use it, just add the `"@serializer serializableClass"` annotation to your property.


## Clone

To clon a class, just call the `clone` method of the class;


## Trouble shooting

* Check your class have its `__name__` attribute defined to something unique
* Check you have registered your class with `SerializableClass.$register(YourClass)`
* Check you have no circular references into your classes


[abitbol]: https://github.com/wanadev/abitbol
