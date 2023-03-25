// Must work with the project's gulp
const gulp = require("../gulp");
const glob = require("glob");
const sorted = require("sorted");

let scriptList = {};
let taskList = {};

const FILES = "**/gulpfile.js";

function GulpScripts(files = FILES, options = {}) {

	// Options passed as first parameter
	if (typeof files == "object") {
		options = files;
		files = FILES;
	}

	// Ignore the node modules folder if no ignore option set.
	if (!options.hasOwnProperty("ignore")) {
		options.ignore = "node_modules/**";
	}

	// Find the gulp files
	const scripts = sorted(glob.globSync(files, options));

	// Load each script
	scripts.forEach((script) => {

		const tasks = require(`../../${script}`);

		// Set the script name
		var name = script;
		if (tasks.hasOwnProperty("Name") && typeof tasks.Name == "string") {
			name = tasks.Name;
		}
		name = name.replace("/gulpfile.js", "");
		name = name.replaceAll("/", ":");

		// Check for a name clash
		if (scriptList[name]) {
			throw (
				`Name conflict error: ${name}` +
				`\n  from: ${script}` +
				`\n  previously defined in: ${scriptList[name]}`
			);
		}
		scriptList[name] = script;

		// Create the task name and add to gulp
		if (name != "gulpfile.js") {
			for (prop in tasks) {
				if (typeof tasks[prop] == "function") {
					taskName = `${prop}:${name}`;
					taskList[taskName] = tasks[prop];
					gulp.task(taskName, tasks[prop]);
				}
			}
		}
	});

	// Set the included tasks build, clean and watch
	GulpScripts.createTask("build");
	GulpScripts.createTask("clean");
	GulpScripts.createTask("watch");

	// Set a fall back default task
	var tasks = getTasks('default');
	if (tasks.length > 0) {
		gulp.task(`default`, gulp.series.apply(null, tasks));
	}else {
		gulp.task('default', defaultTask);
	}
}

/**
 * Get the current tasks defined.
 *
 * @param {string} taskName
 * @returns
 */
function getTasks(taskName) {

	var tasks = [];
	for (task in taskList) {
		if (task.indexOf(taskName) == 0) {

			// Check name length or break ':' character
			if(task.length == taskName.length ||
				task.indexOf(':') == taskName.length
			) {
				tasks[tasks.length] = task;
			}
		}
	}

	return tasks;
}

/**
 * A simple default task
 */
function defaultTask(cb)  {
	console.log("Nothing to do for task: default");
	cb();
}

/**
 * Create a new task with sub tasks
 * 
 * @param {string} name 
 */
GulpScripts.createTask = (name) => {
	// check name for invalid characters

	tasks = getTasks(name);
	if (tasks.length > 0) {
		gulp.task(`${name}`, gulp.series.apply(null, tasks));
		gulp.task(`${name}:all`, gulp.series.apply(null, tasks));
		gulp.task(`${name}:all:parallel`, gulp.parallel.apply(null, tasks));
	} else {
		gulp.task(`${name}`, taskDefault);
		gulp.task(`${name}:all`, taskDefault);
		gulp.task(`${name}:all:parallel`, taskDefault);
	}

	function taskDefault(cb) {
		console.log(`Nothing to do for task: ${name}`);
		cb();
	}
};

module.exports = GulpScripts;
