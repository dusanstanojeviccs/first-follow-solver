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

				if (terminals.has(rhsElem)) {
					if (!firstSet[rule.lhs].has(rhsElem)) {
						firstSet[rule.lhs].add(rhsElem);
						done = false;	
					}
					
					allEmpty = false;
				} else {
					firstSet[rhsElem].forEach(potential => {
						if (potential != epsilon) {
							if (!firstSet[rule.rhs].has(potential)) {
								firstSet[rule.rhs].add(potential);
								done = false;
							}
						}
					});

					if (!firstSet[rhsElem].has(epsilon)) {
						allEmpty = false;
					}
				}
			});
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
						let modificationHappened = addNext(followSet, firstSet, previousRhsElem, rule.rhs, i);

						if (modificationHappened) {
							done = false;
						}
					}
				}
			}


			for (let i = 0; i < rule.rhs.length; i++) {
				let rhsElem = rule.rhs[i];

				if (terminals.has(rhsElem)) {
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
						if (!followSet[rhsElem].has(firstSetElem)) {
							followSet[rhsElem].add(firstSetElem);
							done = false;
						}
					});
				}
			}
		});
	}
}

function addNext(followSet, firstSet, key, rhs, i) {
	if (i == rhs.length) {
		return;
	}

	let modificationHappened = false;

	firstSet[rhs[i]].forEach(elem => {
		if (elem === epsilon) {
			modificationHappened = modificationHappened || addNext(followSet, followSet, key, rhs, i + 1);
		} else {
			if (!followSet[key].has(elem)) {
				followSet[key].add(elem);
				modificationHappened = true;
			}
		}
	})

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