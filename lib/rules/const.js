/**
 * <p>Copyright (c) 2012 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE file for information about licensing.</p>
 *
 * Constant initializations. Note that constant declarations are handled when entering a context, NOT when the rule is
 * processed. Also note that constants are not part of the JavaScript specification, but are supported by UglifyJS so we
 * don't really have a choice but to support it. A warning is thrown if using this rule.
 *
 * @module rules/const
 * @author Bryan Hughes &lt;<a href='mailto:bhughes@appcelerator.com'>bhughes@appcelerator.com</a>&gt;
 */

/**
 * @name module:rules/const.rule
 * @event
 * @property {String} ruleName The string 'call'
 * @property {module:AST.node} ast The AST node that is an instance of this rule
 * @property {String} file The file that the rule begins on.
 * @property {Integer} line The line of the file where the rule begins on.
 * @property {Integer} column The column of the file where the rule begins on.
 * @property {Boolean} processingComplete Indicates whether the rule has been processed yet or not. This can be used to
 *		determine if this is the pre-evalutation event or the post-evaluation event.
 * @property {Array[Object]} initializations The variables that were initialized. If a variable did not have an
 *		initializer, then it is not included in the array. Each entry in the array contains two properties: reference and
 *		value. Only available post-evaluation.
 * @property {module:Base.ReferenceType} initializations.reference The reference being initialized. Only available post-evaluation.
 * @property {module:Base.BaseType} initializations.value The value that the reference was initialized to. Only available post-evaluation.
 */

var path = require('path'),
	RuleProcessor = require('../RuleProcessor'),
	Base = require('../Base'),
	Runtime = require('../Runtime');

/**
 * Do not call directly. Call {@link RuleProcessor.processRule} instead.
 *
 * AST: [node-info, declarations <array[tuple[name <string>, initialization <ast | null>]]>]
 *
 * @private
 */
exports.processRule = processRule;
function processRule(ast) {
	
	var children = ast[1],
		name,
		i = 0,
		len = children.length,
		context = Runtime.getCurrentContext(),
		reference,
		value,
		initializations = [];
	
	RuleProcessor.fireRuleEvent(ast, {}, false);
	RuleProcessor.logRule('const');

	Runtime.reportWarning('nonStandardRuleUsed',
		'Use of const is discouraged because it is not officially part of JavaScript and is not supported on all runtimes',
		{});
	
	for (; i < len; i++) {
		name = children[i][0];
		
		// Make sure the identifier is not a reserved word
		if (~['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else',
				'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
				'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void',
				'while', 'with '].indexOf(name) || (context.strict && ~['implements', 'interface', 'let',
				'package', 'private', 'protected', 'public', 'static', 'yield'].indexOf(name))) {
			Base.throwNativeException('SyntaxError', 'Invalid identifier name ' + name);
		}
		
		// Ininitialize the variable if it has an initializer
		if (children[i][1]) {
			reference = Base.getIdentifierReference(context.lexicalEnvironment, name, context.strict);
			
			// We must always process the children, but we don't necessarily want to use the value, hence the two lines
			value = Base.getValue(RuleProcessor.processRule(children[i][1]));
			Base.putValue(reference, value);
			
			initializations.push({
				reference: reference,
				value: value
			});
		}
	}
	
	RuleProcessor.fireRuleEvent(ast, {
		initializations: initializations
	}, true);
	
	return ['normal', undefined, undefined];
}
RuleProcessor.registerRuleProcessor(path.basename(__filename, '.js'), exports);