var FirstFollowSolver;FirstFollowSolver =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 138:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "solve": () => /* binding */ solve
/* harmony export */ });
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
	console.log("FIRST SETS", firstSet);
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
	console.log("------");
	console.log("key", key)
	console.log("rhs", rhs)
	console.log("i", i)
	console.log(firstSet)
	console.log(firstSet[rhs[i]])

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

function solve(config) {
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

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(138);
/******/ })()
;