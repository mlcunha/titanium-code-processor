/*global
util
FunctionTypeBase
areAnyUnknown
UnknownType
type
StringType
handleRecoverableNativeException
BooleanType
ObjectType
*/

/*****************************************
 *
 * Boolean Prototype Class
 *
 *****************************************/

/**
 * toString() prototype method
 *
 * @private
 * @see ECMA-262 Spec Chapter 15.6.4.2
 */
function BooleanProtoToStringFunc(className) {
	FunctionTypeBase.call(this, 0, false, className || 'Function');
}
util.inherits(BooleanProtoToStringFunc, FunctionTypeBase);
BooleanProtoToStringFunc.prototype.call = function call(thisVal, args) {
	
	// Validate the parameters
	if (areAnyUnknown((args || []).concat(thisVal))) {
		return new UnknownType();
	}
	
	// Make sure this is a boolean
	if (type(thisVal) !== 'Boolean') {
		if (type(thisVal) === 'Object' && thisVal.className === 'Boolean') {
			return new StringType(thisVal.primitiveValue + '');
		} else {
			handleRecoverableNativeException('TypeError', 'Value is not a boolean or boolean object');
			return new UnknownType();
		}
	} else {
		return new StringType(thisVal.value + '');
	}
};

/**
 * valueOf() prototype method
 *
 * @private
 * @see ECMA-262 Spec Chapter 15.6.4.2
 */
function BooleanProtoValueOfFunc(className) {
	FunctionTypeBase.call(this, 0, false, className || 'Function');
}
util.inherits(BooleanProtoValueOfFunc, FunctionTypeBase);
BooleanProtoValueOfFunc.prototype.call = function call(thisVal, args) {
	
	// Variable declarations
	var b = thisVal;
	
	// Validate the parameters
	if (areAnyUnknown((args || []).concat(thisVal))) {
		return new UnknownType();
	}
		
	if (type(b) !== 'Boolean') {
		if (type(b) === 'Object' && b.className === 'Boolean') {
			b = new BooleanType(b.primitiveValue);
		} else {
			handleRecoverableNativeException('TypeError', 'Value is not a boolean object');
			return new UnknownType();
		}
	}
	return b;
};

/**
 * @classdesc The prototype for Booleans
 *
 * @constructor
 * @see ECMA-262 Spec Chapter 15.6.4
 */
exports.BooleanPrototypeType = BooleanPrototypeType;
function BooleanPrototypeType(className) {
	ObjectType.call(this, className);
	
	this.put('toString', new BooleanProtoToStringFunc(), false, true);
	this.put('valueOf', new BooleanProtoValueOfFunc(), false, true);
}
util.inherits(BooleanPrototypeType, ObjectType);