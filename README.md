# First and Follow set Solver

First and follow set solver in Javascript. This library can be used to help you write your Parsers. It is currently being used to auto generate a parser based on the rule set.

# Demo

To see this library in action check out this [cool tool](https://dusanstanojeviccs.github.io/first-follow-solver/)

# How to add the library to your project?

1. Using npm ```npm install first-follow-solver``` followed by ```import { solve } from 'first-follow-solver'```

2. Or you can compile the library by running ```npm run-script build``` and then adding the dist/first-follow-solver.js to your html directly:
```<script src="./dist/first-follow-solver.js"></script>```

# How to use the library?

```javascript
let problem = {
	rules: [
		{lhs: "S", rhs: ["a", "b"]}, // S -> a b
		{lhs: "S", rhs: ["b", "b"]}, // S -> b b
		{lhs: "S", rhs: ["b"]} //  S -> b
	],
	// if not specified all symbols 
	// not used on the left side will be assumed to be terminals
	terminals: ["a", "b"], 
	start: "S", // S is a default value
	epsilon: "epsilon", // epsilon is the default value
	eof: "$", // $ is the default value
}
```

If included from the ```first-follow-solver.js``` file:
```
console.log("Solution", FirstFollowSolver.solve(problem));
```

If included using npm:
```
console.log("Solution", solve(problem));
```

# Full API

```javascript
solve(config)
validateSymbols(rules, terminals, epsilon)
extractTerminals(rules, mode, epsilon)
parseProgram(text, split)
```

## solve (method)
#### Parameters
-   `config` **[Object][19]** args
		-   `config.rules` an array of rules
				-    `config.rules.0.lhs` an object representing the head of the rule (left hand side)
				-    `config.rules.0.rhs` an array of strings representing the right hand side symbols
		-   `config.terminals` an array of string in which every string is a terminal
		-   `config.start` string that represents the non terminal which starts the program
		-   `config.epsilon` string that represents the epsilon symbol
		-   `config.eof` string that represents the end of file symbol (used for follow sets)
#### Examples
```javascript
let problem = {
	rules: [
		{lhs: "S", rhs: ["a", "b"]}, // S -> a b
		{lhs: "S", rhs: ["b", "b"]}, // S -> b b
		{lhs: "S", rhs: ["b"]} //  S -> b
	],
	// if not specified all symbols 
	// not used on the left side will be assumed to be terminals
	terminals: ["a", "b"], 
	start: "S", // S is a default value
	epsilon: "epsilon", // epsilon is the default value
	eof: "$", // $ is the default value
}

console.log("Solution", FirstFollowSolver.solve(problem));

// result is {"firstSet":{"S":["a","b"]},"followSet":{"S":["$"]}}
```

## validateSymbols (method)

#### Parameters
-   `rules` an array of rules
			-    `rules.0.lhs` an object representing the head of the rule (left hand side)
			-    `rules.0.rhs` an array of strings representing the right hand side symbols
-   `terminals` an array of strings, each string is a terminal
-   `epsilon` string that represents the epsilon symbol

#### Exceptions
- Throws an exception that is a string containing the error if either one of the rules is broken
```
terminals cannot be on the left hand side
```

```
non terminals must be on the left hand side
```

#### Examples
```javascript
let rules = [
		{lhs: "S", rhs: ["a", "b"]}, // S -> a b
		{lhs: "S", rhs: ["b", "b"]}, // S -> b b
		{lhs: "S", rhs: ["b"]} //  S -> b
];
let terminals = ["a", "b"];
let epsilon = "epsilon";

FirstFollowSolver.validateSymbols(rules, terminals, epsilon);
```
## extractTerminals (method)
#### Parameters
-   `rules` an array of rules
  -    `rules.0.lhs` an object representing the head of the rule (left hand side)
	-    `rules.0.rhs` an array of strings representing the right hand side symbols
-   `mode` a string that represents how the values are to be extracted
			-   "lowercase" symbols are extracted as terminals if they contain a lowercase char
			-   "notLhs" symbols are extracted as terminals if they are not rule heads (left hand side)
-   `epsilon` string that represents the epsilon symbol
#### Examples
```javascript
let rules = [
		{lhs: "S", rhs: ["a", "b"]}, // S -> a b
		{lhs: "S", rhs: ["b", "b"]}, // S -> b b
		{lhs: "S", rhs: ["b"]} //  S -> b
];
let mode = "lowercase";
let epsilon = "epsilon";

console.log("Terminals", FirstFollowSolver.extractTerminals(rules, mode, epsilon));
// result is [a, b]
```

## parseProgram (method)
#### Parameters 
-   `text` the full program defined as a string, rules are separated into new lines
-   `split` the string used to separate mutliple single line rules. Example ```S -> A | B```

#### Examples
```javascript
let grammarAsStr = "S -> demo | epsilon";
let split = "|";

console.log("Rules", FirstFollowSolver.parseProgram(grammarAsStr, split));
// result is [{lhs: "S", rhs: ["demo", "epsilon"]}]
```

### Feel free to contact me at email me at dusan.stanojevic.cs@gmail.com