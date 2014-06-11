/**
 * Returns __coverage__ global object from istanbul instrumented code. 
 */
function getCoverage(){
	return JSON.stringify(__coverage__);	
}

module.exports = {
    getCoverage: getCoverage
};