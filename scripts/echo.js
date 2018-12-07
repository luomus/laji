const chalk  = require('chalk');

const args = process.argv;
const msg = args[2];

console.log(chalk.green(msg));
