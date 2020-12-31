# First and Follow set Solver

First and follow set solver in Javascript. This library can be used to help you write your Parsers. It is currently being used to auto generate a parser based on the rule set.

# Demo

To see the demo of this library in action check out this [cool tool](https://dusanstanojeviccs.github.io/first-follow-solver/)

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

### Feel free to contact me at email me at dusan.stanojevic.cs@gmail.com