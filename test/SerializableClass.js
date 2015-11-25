"use strict";

var expect = require("expect.js");
var SerializableClass = require("../lib/SerializableClass.js");

describe("SerializableClass", function() {

    var TestClass = SerializableClass.$extend({
        __name__: "TestClass",
        meth1: function() {},
        prop1: 1,
        getProp2: function() {
            return 2;
        },
        getProp3: function() {
            return this.$data.prop3;
        },
        setProp3: function(v) {
            this.$data.prop3 = v;
        },
        getProp4: function() {
            return this.$data.prop4;
        },
        setProp4: function(v) {
            "@serializable false";
            this.$data.prop4 = v;
        }
    });

    it("can deserialize values passed to the constructor (__init__)", function() {
        var test = new TestClass({
            foo: "bar",
            prop1: 42,
            prop2: 43,
            prop3: 44,
            prop4: 45
        });

        expect(test.prop1).to.equal(1);
        expect(test.prop3).to.equal(44);
        expect(test.prop4).to.equal(45);
    });

    it("can serialize itself (serialize)", function() {
        var test = new TestClass({
            foo: "bar",
            prop1: 42,
            prop2: 43,
            prop3: 44,
            prop4: 45
        });

        expect(test.serialize()).to.eql({
            __name__: "TestClass",
            id: test.id,
            prop3: 44
        });
    });

    it("can unserialize itself (unserialize)", function() {
        var test = new TestClass();

        expect(test.unserialize.bind(test, {
            id: "testid",
            noprop: "bar",
            prop1: 111,
            prop2: 222,
            prop3: 333,
            prop4: 444
        })).to.throwException(/WrongClassUnserialization/);

        test = new TestClass();
        test.unserialize({
            __name__: "TestClass",
            id: "testid",
            noprop: "bar",
            prop1: 111,
            prop2: 222,
            prop3: 333,
            prop4: 444
        });

        expect(test.id).to.equal("testid");
        expect(test.noprop).to.be(undefined);
        expect(test.prop1).to.equal(1);
        expect(test.prop2).to.equal(2);
        expect(test.prop3).to.equal(333);
        expect(test.prop4).to.be(undefined);
    });

    it("can unserialize any class derivated from SerializableClass (SC.$register/SC.$unserialize)", function() {
        var data = {
            __name__: "TestClass",
            id: "testid",
            prop3: 333
        };
        expect(SerializableClass.$unserialize.bind(null, data)).to.throwException(/UnreferencedSerializableClass/);

        SerializableClass.$register(TestClass);
        var test = SerializableClass.$unserialize(data);

        expect(test instanceof TestClass).to.be.ok();
        expect(test.serialize()).to.eql(data);
    });
});
