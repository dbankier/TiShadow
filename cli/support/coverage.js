/**
 * Facade for istanbul coverage operations support.
 *
 */

var path = require('path'),
	fs = require('fs'),
    istanbul = require('istanbul'),
    Instrumenter = istanbul.Instrumenter,
    Collector = istanbul.Collector,
    instrumenter = new Instrumenter({embedSource:true}),
    Report = istanbul.Report,
    collector;
 
/**
 * returns the coverage collector, creating one if necessary and automatically
 * adding the contents of the global coverage object. 
 */
function getCollector() {
    if (!collector) {
        collector = new Collector();
    }
    return collector;
}
/**
 * adds coverage to the collector for browser test cases
 * @param coverageObject the coverage object to add
 */
function addCoverage(coverageObject) {
    if (!collector) { collector = new Collector(); }
    collector.add(coverageObject);
}
 
/**
 * writes reports for everything accumulated by the collector
 * @method writeReports
 * @param dir the output directory for reports
 * @param type the type of the report. See https://github.com/gotwarlost/istanbul#the-report-command
 */
function writeReports(dir, types) {
    writeReportsInternal(dir, getCollector(), types);
}
 
function writeReportsInternal(dir, collector, types) {
    dir = dir || process.cwd();
    
    types.split(',').forEach(function(type){
    	type = type.replace(/^\s+|\s+$/g, '');
    	var report = Report.create(type, {dir : dir, verbose : false});
    	report.writeReport(collector, true); 
    });
} 
/**
 * returns the instrumented version of the code specified
 * @param {String} code the code to instrument
 * @param {String} file the file from which the code was load
 * @return {String} the instrumented version of the code in the file
 */
function instrumentCode(code, filename) {
    filename = path.resolve(filename);
    return instrumenter.instrumentSync(code, filename);
}

/**
 * Filter intrumentedFiles with files added to collector
 * If file is not required, istanbul doesn't include it on coverage report
 * https://github.com/gotwarlost/istanbul/issues/112#issuecomment-29679800
 *  
 * @param instrumentedFiles : All no spec js files.
 * @returns {Array} files don't added to coverage 
 */
function getNoInstrumentedFiles(instrumentedFiles){
	var no_instrumented = [];
	
	instrumentedFiles.forEach(function(instrumentFile){
		if ( !getCollector().store.map[instrumentFile]){
			//console.log("Adding " + instrumentFile);
			no_instrumented.push(instrumentFile);
		}
	});
	return no_instrumented;
}

function gettingStringObject(path){ /*TODO: better matchs statements*/
	var objStr = ''
	,	variable = ''
	,	flag = false
	,	file = fs.readFileSync(path, "utf8");
	
	file.split('\n').forEach(function(line){
		if (line){
			if (line.match("'return this'")){
				objStr = line;
				variable = addslashes((line.split(' = ')[0]).replace('var ', ''));
				flag = true;
			}
			else if(line.match(variable +" = " + variable + "\\[")) { flag = false; }
			else if(flag){ objStr +=line; }
		}
	});
	
	//console.log(" adding " + path);
	return objStr;
}

function addslashes(str) { 
    return (str + '').replace(/[[\\^$.|?*+(){}]/g, '\\$&').replace(/\u0000/g, '\\0'); 
}

module.exports = {
    instrumentCode: instrumentCode,
    addCoverage: addCoverage,
    writeReports: writeReports,
    getNoInstrumentedFiles : getNoInstrumentedFiles,
    gettingStringObject : gettingStringObject
};
    