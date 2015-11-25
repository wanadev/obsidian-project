# WanadevProjectManager: SerializableClass

`SerializedClass` is an [abitbol][] class that can serialize its properties. Features:

* Serialize/Unserialize all computed properties that have a getter and a setter,
* Skip properties annotatated with `"@serializable false"`.
* **TODO** ~~Use custom serialization function for specific properties.~~

Example:

    var SerializableClass = require("SerializableClass");

    var Demo = SerializableClass.$extend({
        __name__: "Demo",                     // Must be set to the class name

        __init__: function(params) {          // The constructor takes an object containing values for computed properties (optional)
            this.$data = {};                  // Default values for computed properties
            this.$super(params);              // Call the super constructor to apply given values
            ...                               // Any other initialization code you need
        }

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


## Unserialization

To Unserialize, you can use the constructor:

    var demo = new Demo({
        ...  // your data
    });

or the `unserialize()` method:

    var demo = new Demo();
    demo.unserialize({
        ...  // your data
    });


## Serialization

To serialize, just call the `serialize()` method:

    var data = demo.serialize();



## TODO

* custom serializer `"@serializer name"` class?
* no direct references/ solution (`"@ref"`)?
* register classes
* $unserialize


    SerializableClass.$addSerializer("name", {
        serialize: function(data) {
        },
        unserialize: function(data) {
        }
    });


    getFoo: function() {
        "@ref";
    },

    setFoo: function() {
        "@ref";
    }


[abitbol]: https://github.com/wanadev/abitbol
