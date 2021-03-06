/**
 * <p>Copyright (c) 2012 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE file for information about licensing.</p>
 *
 * ECMA-262 Spec: <em>An array initialiser is an expression describing the initialisation of an Array object, written in
 * a form of a literal. It is a list of zero or more expressions, each of which represents an array element, enclosed in
 * square brackets. The elements need not be literals; they are evaluated each time the array initialiser is
 * evaluated.</em>
 *
 * @module rules/array
 * @author Bryan Hughes &lt;<a href='mailto:bhughes@appcelerator.com'>bhughes@appcelerator.com</a>&gt;
 * @see ECMA-262 Spec Chapter 11.1.4
 */

/**
 * @name module:rules/array.rule
 * @event
 * @property {String} ruleName The string 'array'
 * @property {module:AST.node} ast The AST node that is an instance of this rule
 * @property {String} file The file that the rule begins on.
 * @property {Integer} line The line of the file where the rule begins on.
 * @property {Integer} column The column of the file where the rule begins on.
 * @property {Boolean} processingComplete Indicates whether the rule has been processed yet or not. This can be used to
 *		determine if this is the pre-evalutation event or the post-evaluation event.
 * @property {module:Base.ArrayType} result The array that was created. Only available post-evaluation.
 */

var path = require('path'),
	RuleProcessor = require('../RuleProcessor'),
	Base = require('../Base');

/**
 * Do not call directly. Call {@link RuleProcessor.processRule} instead.
 *
 * AST: [node-info, elements <array[ast]>]
 *
 * @private
 */
exports.processRule = processRule;
function processRule(ast) {
	
	var elements = ast[1],
		array = new Base.ArrayType(),
		i = 0,
		len = elements.length;
	
	RuleProcessor.fireRuleEvent(ast, {}, false);
	RuleProcessor.logRule('array');
	
	array.put('length', new Base.NumberType(len), false, true);
	
	for (; i < len; i++) {
		array.defineOwnProperty(i + '', {
			value: Base.getValue(RuleProcessor.processRule(elements[i])),
			writable: true,
			enumerable: true,
			configurable: true
		}, false);
	}
	
	RuleProcessor.fireRuleEvent(ast, {
		result: array
	}, true);
	
	return array;
}
RuleProcessor.registerRuleProcessor(path.basename(__filename, '.js'), exports);