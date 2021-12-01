/**
 * Carthage build hook
 *
 * Copyright (c) 2019-present by Axway Appcelerator
 * All Rights Reserved.
 */

'use strict';

const spawn = require('child_process').spawn;
const path = require('path');

exports.id = 'ti.socketio.carthage';
exports.cliVersion = '>=3.2';
exports.init = init;

/**
 * Main entry point for our plugin which looks for the platform specific
 * plugin to invoke
 */
function init (logger, config, cli, appc) {
	cli.on('build.module.pre.compile', {
		pre: function (builder, done) {
			logger.info('Running carthage...');

			const p = spawn('carthage', [ 'bootstrap', '--platform', 'ios', '--cache-builds', '--use-xcframeworks' ], { cwd: builder.projectDir });
			p.stderr.on('data', data => logger.error(data.toString().trim()));
			p.stdout.on('data', data => logger.trace(data.toString().trim()));
			p.on('close', function (code) {
				if (code !== 0) {
					return done(new Error(`Failed to run carthage properly, exited with code: ${code}`));
				}

				const fs = require('fs-extra');
				const subdirs = fs.readdirSync(path.join(builder.projectDir, 'Carthage/Build'));
				const frameworkDirs = subdirs.filter(dir => dir.endsWith('.xcframework'));
				for (const frameworkDir of frameworkDirs) {
					fs.copySync(path.join(builder.projectDir, 'Carthage/Build', frameworkDir), path.join(builder.projectDir, 'platform', frameworkDir));
				}
				done();
			});
		}
	});
}
