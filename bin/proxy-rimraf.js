const {rimraf} = require('rimraf');
const [,, ...args] = process.argv;

(async () => {
  try {
    await rimraf(args.join(' '));
  } catch (e) {
    console.error(err);
  }
})()
