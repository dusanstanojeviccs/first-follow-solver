# First and Follow set Solver

First and follow set solver in Javascript. This library can be used to help you write your Parsers. It is currently being used to auto generate a parser based on the rule set.

# How to add the library to your project?

1. To include the library you can either install it with npm ```npm install first-follow-solver```

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

console.log("Solution", FirstFollowSolver.solve(problem));
```

### I have not had the time to write all test cases yet, if you add some use cases feel free to open a PR and email me at dusan.stanojevic.cs@gmail.com