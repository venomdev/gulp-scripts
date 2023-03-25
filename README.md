# gulp-scripts

gulp-scripts is a utility to create multiple gulpfile.js files throughout your
project and have the top most level gulpfile convert them to standard gulp tasks.

It was designed for projects that are built from many smaller projects under a
single parent folder. Each subfolder is written like a normal stand alone gulpfile project.

```
project/
	gulpfile.js			# <- this is your gulp-scripts main entry file
	libraries/
		users/
			gulpfile.js
	plugins/
		slideshow/
			gulpfile.js
		scheduler/
			gulpfile.js
	themes/
		dark/
			gulpfile.js
		light/
			gulpfile.js

```

## Installation

Install this package with NPM and add it to your development dependencies.

`npm install --save-dev gulp-scripts`

## Usage

### Command line usage

An example of a gulp-scripts task command would include a gulpfile.js from a subfolder
called plugins/slideshow. The folder names automatically become part of the task name.

`gulp build:plugins:slideshow`

Another example using a subfolder named libraries/users.

`gulp watch:libraries:users`

The top level gulp script can be called with a simple task command and any
subfolders that support a version of that command will also be run.

`gulp build`

This gulp command will run the build task for every gulpfile found with a build task.

```
[16:08:17] Starting 'build'...
[16:08:17] Starting 'build:libraries:users'...
Build the users library.
[16:08:17] Finished 'build:libraries:users' after 1.15 ms
[16:08:17] Starting 'build:plugins:slideshow'...
Build the slide show plugin.
[16:08:17] Finished 'build:plugins:slideshow' after 1.02 ms
[16:08:17] Finished 'build' after 5.01 ms
```

### Include subfolder gulp files

gulp-script is called directly as a normal function. It supports up to two parameters,
being the file search type and the options for the search.

```javascript
var gulpScripts = require("gulp-scripts");

// Include all gulpfiles
gulpScripts("**/gulpfiles.js");

// Including all gulpfiles is the default so a simpler version is available.
// This command will do the same as the previous command.
gulpScripts();

// You may choose to use a different naming scheme. This command will only
// look for files in gulpfiles subfolders and the files can be named for different
// sections within the project like styles.js, scripts.js or anything else.
gulpScripts("**/gulpfiles/**.js");
```

### gulp-script parameters and options

gulp-scripts uses [glob](https://www.npmjs.com/package/glob) to scan folders and
subfolders to find valid gulpfiles to include. All the search path strings and options
are passed directly to glob so please refer to the glob documentation for how
to locate your gulpfiles.

```javascript
// This command uses both the search path and the options parameter
// The option to ignore node_modules is also default so it's not required here
gulpScripts("**/gulpfiles.js", { ignore: "node_modules/**" });
```

Because the `ignore: node_modules/**` setting is the default, if you choose to overwrite
the ignore setting you will need to include `node_moodules/**` as part of your
command.

```javascript
gulpScripts("**/gulpfiles.js", { ignore: ["tests/**", "node_modules/**"] });
```

Because the search term `**/gulpfiles.js` is the default parameter you can
also leave it out and just specify the options. This will use the default search
path and use the custom options.

```javascript
gulpScripts({ ignore: ["tests/**", "node_modules/**"] });
```

### Exporting tasks

For a gulp task to be recognized it must use the `exports.taskName` example used
with [gulp v4](https://github.com/gulpjs/gulp). For a more complicated task name
you can use the `exports['complicated:task:name']` format.

```javascript
const gulp = require("gulp");

function build(cb) {
	console.log("Build this module.");
	cb();
}

exports.build = build;
```

You can override the default task name that would use the folder names to generate the task. This can be done with an `exports.Name` option.

```javascript
const gulp = require("gulp");

// This file could be in a subfolder of plugins/plg_slideshow
// and now it becomes slideshow
exports.Name = "slideshow";

function build(cb) {
	console.log("build this module");
	cb();
}

exports.build = build;
```

The previous example is now used as

`gulp build:slideshow`

### Included tasks

gulp-scripts includes three tasks, `build`, `clean` and `watch`.
These commands will automatically scan for any tasks that use the `build:`,
`clean:` or `watch:` prefix.

The full name of these tasks are `build:all`, `clean:all` and `watch:all` so you
can replace the `build`, `clean` and `watch` tasks without overwriting the included
tasks.

These tasks have three variations, the simple `build` and `build:all` being equilavent
tasks uses `gulp.series` to run each subfolder's tasks. The third variation is
called `build:all:parallel` and this uses `gulp.parallel` to run the build task in parallel.

### Creating custom top level tasks

You can also create your own top level task by using the `gulpScripts.createTask`
method. This example will create a new top level task name and automatically add any subfolder tasks that start with the same prefix.

```javascript
const gulp = require("gulp");
const gulpScripts = require("gulp-scripts");

// Create a task to build style sheets
gulpScripts.createTask("build:styles");
```

You can now create tasks in a subfolder that work on building the style sheets
separately. The rest of the folder suffix will still be applied correctly.

```javascript
const gulp = require("gulp");

function buildStyles(cb) {
	console.log("Build the style sheets.");
	cb();
}

exports["build:styles"] = buildStyles;
```

Because the previous example starts with a `build:` prefix it will still be called
when a `gulp build` command is run.

Using the `gulpScripts.createTask` method will automatically create the three variations
for you. The named version you created `build:styles`, the `gulp.series` version called
`build:styles:all` and the `gulp.parallel` version called `build:styles:all:parallel`

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
