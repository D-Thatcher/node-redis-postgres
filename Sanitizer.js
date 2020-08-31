var xssFilters = require('xss-filters');


function cleanHTMLString(s){
    return xssFilters.inHTMLData(s)

}

module.exports = {cleanHTMLString};
