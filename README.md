Titanium Code Processor
=======================

The Titanium Code Processor is a tool for analyzing JavaScript code in 
[Titanium Mobile](https://github.com/appcelerator/titanium_mobile) projects. It 
provide a wide variety of useful functionality, including runtime error detection, 
Titanium API deprecation warnings, platform specific API validation, and more. 
It is built using a robust plugin solution that makes it relatively easy to add
new analyses to the code processor. The tool can be used as a stand-alone binary, 
used as part of the Titanium CLI, or incorporated as a library into other node.js
applications (See the API documentation in the 'docs' folder for more 
information on using the code processor as a library).

## Quickstart

### Install the code processor using NPM
```
[sudo] npm install -g titanium-code-processor
```
The code processor relies on the new [Titanium CLI](https://github.com/appcelerator/titanium), 
so if you haven't installed it already, do so before running the code processor.

### Run the code processor
```
titanium-code-processor <path to project>
```

## Overview

At the core of the code processor is an ECMAScript 5 interpreter that has been
specially designed to work offline. To make this work, two new concepts have
been introduced: an 'unknown' data type and 'ambiguous modes.'

The unknown data type is pretty self-explanatory; it's a value that we don't know
the value of. For example, if the following code is run:
```JavaScript
var x = Date.now();
```
x will be set to unknown since the date changes from run to run and isn't known
at compile time. Operations on unknown values always produce unknown values. For
example, y evaluates to unknown in all of the following circumstances:
```JavaScript
var x = Date.now(),
	y;
y = x + 20;
y = x > 100;
y = x.foo();
y = x.toString();
y = typeof x;
```
Ambiguous modes occur when we are evaluating code without knowing exactly how
it is invoked. There are two types of ambiguous mode: ambiguous context mode and 
ambiguous block mode. 

An ambiguous context is a function or module that is invoked
without knowing exactly how it was invoked. All callbacks passed to the Titanium 
API are evaluated as ambiguous contexts, and any functions called from an ambiguous
block is called as an ambiguous context. In the following example, y is set to
unknown:
```JavaScript
var y;
setTimeout(function () {
	y = 20;
}, 10)
```

An ambiguous block is a loop/conditional body that is evaluated without knowing
the exact circumstances it is evaluated in. If statements and while/do-while 
loops are evaluated as an ambiguous block if the conditional is unknown. For and
for-in loops are evaluated as an ambiguous block if some part of the iteration
conditions are unknown. All assignments in an ambiguous block evaluate to unknown
and all functions called from an ambiguous block are evaluated in an ambiguous
context. In the following example, y is set to unknown:
```JavaScript
var x = Date.now(),
	y;
if (x) {
	y = 10;
} else {
	y = 20;
}
```

## Running

The code processor can either be run using a built-in script or as part of the
Titanium CLI.

### Running using the built-in bin script

```
titanium-code-processor [project-dir] [options]
```

#### List of options
option | description
-------|------------
--plugin, -p &lt;plugin name&gt; | Specifies a plugin to load. The -p flag expects the name of a single plugin, e.g. ```-p analysis-coverage```
--config, -c &lt;option=value&gt; | Specifies a configuration option and it's value, e.g ```-c invokeMethods=false```
--verbose, -v | Enables verbose logging, equivalent to ```-l debug```
--log-level, -l | Sets the log level. Possible values are 'error', 'warn', 'notice', 'info', 'debug', or 'trace'
--osname, -o | The name of the OS being analyzed for. This is the value that will be reported via 'Ti.Platform.osname', e.g. 'android'
--help, -h | Displays the help
Note: if no plugins are specified, all plugins are loaded

### Running as part of the Titanium CLI

The code processor is integrated as a build step in the CLI. To enable it, add
the following to your tiapp.xml:
```xml
<code-processor>
	<enabled>true</enabled>
</code-processor>
```
Options and plugins can also be specified in the tiapp.xml, as the following 
example shows:
```xml
<code-processor>
	<enabled>true</enabled>
	<options>
		<nativeExceptionRecovery>true</nativeExceptionRecovery>
		<invokeMethods>false</invokeMethods>
	</options>
	<plugins>
		<plugin>analysis-coverage</plugin>
		<plugin>require-provider</plugin>
	</plugins>
</code-processor>
```

### Runtime Options

These options can be set at the command line by using the '-c' flag from the code
processor command, or by setting the option in the tiapp.xml file if using the
Titanium CLI.

name | type | default | description
-----|------|---------|------------
invokeMethods | boolean | true | Indicates whether or not to invoke methods. If set to false, the method is evaluated once in ambiguous context mode.
evaluateLoops | boolean | true | Indicates whether or not to evaluate loops. If set to false, the loop body and any loop conditionals are evaluated once in ambiguous block mode.
maxLoopIterations | integer | 1000000000000 | The maximum number of iterations of a loop to evaluate. If this threshold is exceeded, the block is evaluated once in ambiguous block mode. Note: this threshold makes it impossible to analyze infinite loops.
maxRecursionLimit | integer | 1000 | The maximum function call depth to evaluate, similar to a stack size limit. If this threshold is exceeded, function bodies are not evaluated and unknown is returned. Note: this threshold makes it impossible to analyze infinite recursion.
logConsoleCalls | boolean | true | If enabled, all console.* calls in a user's code are logged to the terminal using the appropriate log level.
executionTimeLimit | integer | undefined | The maximum time to execute the code before throwing an exception. If not defined, the code processor will run as long as it takes to complete the analysis.
exactMode | boolean | false | Enables exact mode and causes the code processor act exactly like a standard JavaScript interpreter. Intended primarily for unit testing and is not recommended for project .analysis
nativeExceptionRecovery | boolean | false | When enabled, the code processor will recover from many types of native exceptions and continue analysis. Enabling this has the potential of generating incorrect results, but can be used to parse code that normally wouldn't be parsed because of an error.

## Plugins

Plugins are informally grouped into two types: analyzers and providers. Providers 
provide some sort of feature in the runtime that is not included in the ECMAScript 
specification, such as the Titanium Mobile API. Providers do not report any 
results. Analyzers do not provide any features in the runtime but instead analyze
code and do report results. Many analyzers depend on providers to work. All of the
current plugins are listed below, along with their type and if they have any other
dependencies

name | type | dependencies | description
-----|------|--------------|------------
analysis-coverage | analyzer | &lt;none&gt; | Reports the number of AST nodes that were analyzed on a global and per-file/eval basis.
common-globals | provider | &lt;none&gt; | Provides implementations for common globals that aren't part of the JavaScript spec but are provided on all Titanium Mobile platforms (setTimeout, console, etc).
require-finder | analyzer | require-provider | Reports all files that are ```require()```'d in a project.
require-provider | provider | &lt;none&gt; | Provides an implementation of ```require()``` that matches the Titanium Mobile implementation, including its inconsistencies with CommonJS.
ti-api-deprecation-finder | analyzer | ti-api-processor | Reports all deprecated APIs used by the project.
ti-api-platform-validator | analyer | ti-api-processor | Reports all instances where a platform specific feature is used on the wrong platform, e.g. calling ```Ti.Android.createIntent``` on iOS.
ti-api-processor | provider | &lt;none&gt; | Provides an implementation of the Titanium Mobile API. This implementation reads the API documentation for the SDK used by the project to create the API implementation. As such, the SDK specified in the project's tiapp.xml file *must* be installed.
ti-api-usage-finder | analyzer | ti-api-processor | Reports all Titanium Mobile APIs used by the project.
ti-include-finder | analyzer | ti-api-processor | Reports all files that are ```Ti.include()```'d by the project.