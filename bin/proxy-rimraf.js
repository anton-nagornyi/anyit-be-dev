const rimraf = require('rimraf');
const [,, ...args] = process.argv;

rimraf(args.join(' '), (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
