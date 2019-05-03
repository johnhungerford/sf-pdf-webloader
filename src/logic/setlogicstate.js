d = require('../components/state');

module.exports = function(state) {
    for(key in state) {
        if (d.hasOwnProperty(key)) {
            d[key] = state[key];
        }
    }
}
