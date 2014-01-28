exports.cliVersion = '>=3.X';

exports.init = function (logger, config, cli, appc) {

	cli.addHook('build.pre.construct', function (build, finished) {
		build.deployType = 'development';
		finished();
	});
};
