/**
 * Facade for istanbul coverage operations support.
 *
 */

var path = require('path'),
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
 
module.exports = {
    instrumentCode: instrumentCode,
    addCoverage: addCoverage,
    writeReports: writeReports
};
    