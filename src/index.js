class IterableSet {
	constructor(elems) {
		this.elems = [];

		if (elems) {
			for (let i = 0; i < elems.length; i++) {
				this.add(elems[i]);
			}
		}
	}

	has(elem) {
		for (let i = 0; i < this.elems.length; i++) {
			if (this.elems[i] === elem) {
				return elem;
			}
		}
	}
	add(elem) {
		if (!this.has(elem)) {
			this.elems.push(elem);
		}
	}
	addAll(elems) {
		elems.forEach(elem => this.add(elem));
	}
	length() {
		return this.elems.length;
	}
	forEach(consumer) {
		for (let i = 0; i < this.elems.length; i++) {
			consumer(this.elems[i], i);
		}
	}
	forEachInReverse(consumer) {
		for (let i = this.elems.length - 1; i >= 0; i--) {
			consumer(this.elems[i], i);
		}
	}
	at(index) {
		return this.elems[index];
	}
	toArray() {
		return this.elems;
	}
}

function prepare(rules, configTerminals) {
	let all = new IterableSet();
	let allNonTerminals = new IterableSet();
	let terminals;
	
	rules.forEach(rule => {
		all.add(rule.lhs);
		all.add(rule.rhs);

		allNonTerminals.add(rule.lhs);
	})

	if (configTerminals) {
		terminals = new IterableSet(configTerminals);
	} else {
		terminals = new IterableSet();

		all.forEach(elem => {
			if (!allNonTerminals.has(elem)) {
				terminals.add(elem);
			}
		});
	}

	return {all, allNonTerminals, terminals};
}

function solveFirstSet(rules, firstSet, terminals, epsilon) {
	let done = false
	while (!done) {
		done = true;

		// let's apply rules
		rules.forEach(rule => {
			let allEmpty = true;
			rule.rhs.forEach(rhsElem => {
				if (!allEmpty) {
					return;
				}

				if (terminals.has(rhsElem) || epsilon == rhsElem) {
					if (!firstSet[rule.lhs].has(rhsElem)) {
						firstSet[rule.lhs].add(rhsElem);
						done = false;	
					}
					
					allEmpty = false;
				} else {
					firstSet[rhsElem].forEach(potential => {
						if (potential != epsilon) {
							if (!firstSet[rule.lhs].has(potential)) {
								firstSet[rule.lhs].add(potential);
								done = false;
							}
						}
					});

					if (!firstSet[rhsElem].has(epsilon)) {
						allEmpty = false;
					}
				}
			});

			if (allEmpty) {
				firstSet[rule.lhs].add(epsilon);
			}
		});
	}
}

function solveFollowSet(rules, firstSet, followSet, terminals, epsilon, start, eof) {
	let done = false
	while (!done) {
		done = true;

		followSet[start].add(eof);


		// let's apply rules
		rules.forEach(rule => {
			if (rule.lhs == start) {
				// we have to go in reverse and while there are elements that are epsilon in first set
				// we have to add the eof to the last possible element of the start

				for (let i = rule.rhs.length - 1; i >= 0; i--) {
					if (terminals.has(rule.rhs[i])) {
						break;
					}
					if (!followSet[rule.rhs[i]].has(eof)) {
						followSet[rule.rhs[i]].add(eof);
						done = false;
					}

					if (!firstSet[rule.rhs[i]].has(epsilon)) {
						break;
					}
				}
			}
					

			for (let i = 1; i < rule.rhs.length; i++) {
				let previousRhsElem = rule.rhs[i - 1];
				let rhsElem = rule.rhs[i];

				if (!terminals.has(previousRhsElem)) {

					if (terminals.has(rhsElem)) {
						if (rhsElem != epsilon) {
							if (!followSet[previousRhsElem].has(rhsElem)) {
								followSet[previousRhsElem].add(rhsElem);
								done = false;
							}
						}
					} else {
						let modificationHappened = addNext(followSet, firstSet, previousRhsElem, rule.rhs, i, epsilon, terminals);

						if (modificationHappened) {
							done = false;
						}
					}
				}
			}


			for (let i = 0; i < rule.rhs.length; i++) {
				let rhsElem = rule.rhs[i];

				if (terminals.has(rhsElem) || rhsElem == epsilon) {
					continue;
				}

				let allHaveEpsilon = true;
				for (let j = i + 1; j < rule.rhs.length; j++) {
					if (rule.rhs[j] != epsilon || terminals.has(rule.rhs[j]) || !firstSet[rule.rhs[j]].has(epsilon)) {
						allHaveEpsilon = false;
					}
				}

				if (allHaveEpsilon) {
					
					followSet[rule.lhs].forEach(followSetElem => {
						if (!followSet[rhsElem].has(followSetElem)) {
							followSet[rhsElem].add(followSetElem);
							done = false;
						}
					});
				}
			}
		});
	}
}

function addNext(followSet, firstSet, key, rhs, i, epsilon, terminals) {
	if (i == rhs.length) {
		return;
	}

	let modificationHappened = false;

	if (terminals.has(rhs[i])) {
		if (!followSet[key].has(rhs[i])) {
			followSet[key].add(rhs[i]);
			return true;
		}
		return false;
	}

	firstSet[rhs[i]].forEach(elem => {
		if (elem === epsilon) {
			modificationHappened = modificationHappened || addNext(followSet, followSet, key, rhs, i + 1, epsilon, terminals);
		} else {
			if (!followSet[key].has(elem)) {
				followSet[key].add(elem);
				modificationHappened = true;
			}
		}
	});

	return modificationHappened;
}

export function solve(config) {
	let rules = config.rules || [];
	let start = config.start || "S";
	let epsilon = config.epsilon || "epsilon";
	let eof = config.eof || "$";

	let {all, allNonTerminals, terminals} = prepare(rules, config.terminals);

	// at this point we know the terminals, non terminals and the rules
	// we can start solving the issue
	let firstSet = {};
	let followSet = {};
	
	allNonTerminals.forEach(nonTerminal => {
		firstSet[nonTerminal] = new IterableSet();
		followSet[nonTerminal] = new IterableSet();
	});
	
	solveFirstSet(rules, firstSet, terminals, epsilon);
	solveFollowSet(rules, firstSet, followSet, terminals, epsilon, start, eof);

	allNonTerminals.forEach(nonTerminal => {
		firstSet[nonTerminal] = firstSet[nonTerminal].toArray();
		followSet[nonTerminal] = followSet[nonTerminal].toArray();
	});

	return {firstSet, followSet};
}

export function validateSymbols(rules, terminals, epsilon) {
	// terminals cannot be on the left hand side
	for (let i = 0; i < terminals.length; i++) {
		let terminal = terminals[i];

		for (let j = 0; j < rules.length; j++) {
			if (rules[j].lhs == terminal) {
				throw `Terminal '${terminal}' is used on the left side (head) of a rule`;
			}
		}
	}
	// non terminals must be on the left hand side
	let nonTerminals = new Set();
	for (let j = 0; j < rules.length; j++) {
		nonTerminals.add(rules[j].lhs);
		let rhs = rules[j].rhs;

		for (let i = 0; i < rhs.length; i++) {
			if (terminals.indexOf(rhs[i]) < 0 && rhs[i] != epsilon) {
				nonTerminals.add(rhs[i]);
			}
		}
	}

	nonTerminals = Array.from(nonTerminals);
	for (let i = 0; i < nonTerminals.length; i++) {
		let used = false;

		for (let j = 0; j < rules.length; j++) {
			if (rules[j].lhs == nonTerminals[i]) {
				used = true;
				break;
			}
		}

		if (!used) {
			throw `Non Terminal '${nonTerminals[i]}' was not used on the left side (head) of a single rule`;
		}
	}

	return nonTerminals;
}

export function extractTerminals(rules, mode, epsilon) {
	let terminals = new Set();
	if (mode == "lowercase") {
		for (let i = 0; i < rules.length; i++) {
			let rhs = rules[i].rhs;

			for (let j = 0; j < rhs.length; j++) {
				if (rhs[j] != epsilon && rhs[j].toUpperCase() != rhs[j]) {
					// the element is not uppercase and we're in lowercase mode
					// thus this is a terminal
					
					terminals.add(rhs[j]);
				}
			}
		}
	} else {
		// mode is not lowercase
		// thus everything not on the left side is a terminal

		let nonTerminals = new Set();
		for (let i = 0; i < rules.length; i++) {
			nonTerminals.add(rules[i].lhs);
		}

		// now we add all that are not on the left side to the terminals
		for (let i = 0; i < rules.length; i++) {
			let rhs = rules[i].rhs;
			for (let j = 0; j < rhs.length; j++) {
				if (!nonTerminals.has(rhs[j]) && rhs[j] != epsilon) {
					terminals.add(rhs[j]);
				}
			}
		}
	}

	return Array.from(terminals); // we convert the set to an array
}

export function parseProgram(text, split) {
	text = text.replace("→", "->");

	let lines = text.split("\n");
	let rules = [];

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i].trim();

		if (line == "") {
			continue;
		}

		let parts = line.split("->");

		if (parts.length == 2) {
			let lhs = parts[0].trim();
			if (lhs.length == 0) {
				throw `Line ${i + 1} contains no symbols on the left hand side (head) of the rule`;
			}

			let rhsSides = parts[1].trim().split(split, -1);

			if (parts[1].trim() == "" || rhsSides.length == 0) {
				throw `Line ${i + 1} contains no symbols on the right hand side of the rule`;
			}

			for (let j = 0; j < rhsSides.length; j++) {
				let rhs = [];

				let arr = rhsSides[j].trim().split(" ");
				for (let k = 0; k < arr.length; k++) {
					if (arr[k]) {
						rhs.push(arr[k]);
					}
				}

				if (rhs.length == 0) {
					throw `Line ${i + 1} contains no symbols on the right hand side of the rule in the part at index ${j}`;
				}
				rules.push({lhs: lhs, rhs: rhs});
			}
		} else if (parts.length > 2) {
			throw `Line ${i + 1} contains more than two '->'`;
		} else {
			throw `Line ${i + 1} contains no '->'`;
		}
	}

	return rules;
}
