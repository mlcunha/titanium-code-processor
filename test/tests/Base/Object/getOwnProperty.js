var path = require("path"),
	Base = require(path.join(require.main.exports.libPath, "Base")),
	assert = require("assert");

var parent,
	obj,
	dataProp = new Base.DataDescriptor(),
	accessorProp = new Base.AccessorDescriptor();
	
function reset(prop, inherit) {
	obj = new Base.TypeObject();
	if (inherit) {
		parent = new Base.TypeObject();
		obj.objectPrototype = parent;
		parent._properties["foo"] = prop;
	} else {
		obj._properties["foo"] = prop;
	}
}

module.exports = [{
		name: "Property does not exist",
		testFunction: function() {
			reset(undefined, false);
			return obj.getOwnProperty("foo");
		},
		props: {
			expectedReturnValue: undefined
		}
	},{
		name: "Data Property",
		testFunction: function() {
			reset(dataProp, false);
			return obj.getOwnProperty("foo");
		},
		props: {
			expectedReturnValue: dataProp
		}
	},{
		name: "Accessor Property",
		testFunction: function() {
			reset(accessorProp, false);
			return obj.getOwnProperty("foo");
		},
		props: {
			expectedReturnValue: accessorProp
		}
	},{
		name: "Inherited data Property",
		testFunction: function() {
			reset(dataProp, true);
			return obj.getOwnProperty("foo");
		},
		props: {
			expectedReturnValue: undefined
		}
	},{
		name: "Inherited accessor Property",
		testFunction: function() {
			reset(accessorProp, true);
			return obj.getOwnProperty("foo");
		},
		props: {
			expectedReturnValue: undefined
		}
	}
];