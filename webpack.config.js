const path = require('path');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'first-follow-solver.js',
		library: 'FirstFollowSolver',
	},
	optimization: {
		minimize: false
	},
};
