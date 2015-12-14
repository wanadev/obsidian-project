"use strict";

var expect = require("expect.js");
var SerializableClass = require("../lib/SerializableClass.js");
var serializer = require("../lib/serializer.js");

describe("serializer", function() {

    before(function() {
        var this_ = this;

        this.Class1 = SerializableClass.$extend({
            __name__: "Class1",

            getProp1: function() { return 1; },
            setProp1: function() {}
        });
        SerializableClass.$register(this.Class1);

        this.Class2 = SerializableClass.$extend({
            __name__: "Class2",

            __init: function(params) {
                this.$data.items = [];
                this.$super(params);
            },

            getItems: function() {
                return this.$data.items;
            },

            setItems: function(v) {
                this.$data.items = v;
            }
        });
        SerializableClass.$register(this.Class2);

        this.Class3 = SerializableClass.$extend({
            __name__: "Class3",

            __init: function(params) {
                this.$data.cls2 = null;
                this.$super(params);
            },

            getCls2: function() {
                return this.$data.cls2;
            },

            setCls2: function(c) {
                this.$data.cls2 = c;
            }
        });
        SerializableClass.$register(this.Class3);

        this.Point = function(x, y) {
            this.x = x;
            this.y = y;
        };

        SerializableClass.$addSerializer("Point", {
            class: this.Point,
            serialize: function(point) {
                return {x: point.x, y: point.y, foo: "bar"};
            },
            unserialize: function(point) {
                return new this_.Point(point.x, point.y);
            }
        });
    });

    describe("getSerializerFromObject", function() {

        it("can return the right serializer from an instance", function() {
            var cls = new this.Class2();
            var sz = serializer.getSerializerFromObject(cls);
            expect(sz).not.to.be(undefined);
            expect(sz.class).to.be(this.Class2);
        });

        it("can return the right serializer a serialized object", function() {
            var obj = {__name__: "Class2", foo: "bar"};
            var sz = serializer.getSerializerFromObject(obj);
            expect(sz).not.to.be(undefined);
            expect(sz.class).to.be(this.Class2);
        });

    });

    describe("objectSerializer", function() {

        it("can serialize a literal object", function() {
            var obj = {
                a: 1,
                b: 2,
                c: {
                    d: 4,
                    e: [1, 2, 3]
                }
            };

            var obj2 = serializer.objectSerializer(obj);

            expect(obj2).to.eql(obj);
            expect(obj2).not.to.be(obj);
            expect(obj2.c).not.to.be(obj.c);
            expect(obj2.c.e).not.to.be(obj.c.e);
        });

        it("can serialize an array", function() {
            var list = [1, 2, [3, 4, {a: 1}]];
            var list2 = serializer.objectSerializer(list);

            expect(list2).to.eql(list);
            expect(list2).not.to.be(list);
            expect(list2[2]).not.to.be(list[2]);
            expect(list2[2][2]).not.to.be(list[2][2]);
        });

        it("can serialize a simple SerializableClass", function() {
            var cls = new this.Class1();
            var obj = serializer.objectSerializer(cls);
            expect(obj).to.eql({
                __name__: "Class1",
                id: cls.id,
                prop1: 1
            });
        });

        it("can serialize recursively SerializableClass", function() {
            var cls = new this.Class3({
                cls2: new this.Class2({
                    items: [
                        new this.Class1(),
                        new this.Class1()
                    ]
                })
            });
            var obj = serializer.objectSerializer(cls);
            expect(obj).to.eql({
                __name__: "Class3",
                id: cls.id,
                cls2: {
                    __name__: "Class2",
                    id: cls.cls2.id,
                    items: [{
                            __name__: "Class1",
                            id: cls.cls2.items[0].id,
                            prop1: 1
                        }, {
                            __name__: "Class1",
                            id: cls.cls2.items[1].id,
                            prop1: 1
                    }]
                }
            });
        });

        it("can serialize any class instance if a serializer is available", function() {
            var obj = {
                pt1: new this.Point(10, 20),
                pt2: new this.Point(100, 200)
            };

            var obj2 = serializer.objectSerializer(obj);

            expect(obj2).to.eql({
                pt1: {
                    __name__: "Point",
                    x: 10,
                    y: 20,
                    foo: "bar"
                },
                pt2: {
                    __name__: "Point",
                    x: 100,
                    y: 200,
                    foo: "bar"
                }
            })
        });

    });

});
