/**
 * Returns __coverage__ global object from istanbul instrumented code. 
 */
function getCoverage(){
	return ( typeof __coverage__ !== 'undefined') ? JSON.stringify(__coverage__) : null;
}

module.exports = {
    getCoverage: getCoverage
};