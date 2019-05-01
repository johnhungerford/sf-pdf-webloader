const d = require('./data.js');
const rn = require('./render.js');
const ajax = require('./ajaxfunctions');

/**
 * This ajax call gets everything started: it pulls the document map (a json config file) from
 * the server, sets it up as a global variable, and calls getDocs() to grab the list of pdfs
 * stored on the server. 
 */

const getSfSchemata = function(stateSetter, callback) {
    ajax.getJSON(
        `/config/sfschema`, 
        function(data) {
            if (!data.success) {
                rn.renderError(stateSetter, 'Can\'t access server!');
                return;
            }

            d.sfschemata = data;
            if(callback instanceof Function) callback();
        },
        function(err) {
            rn.renderError(stateSetter, err.message);
        }
    );
}

const getDm = function(stateSetter, index, callback) {
    if (index < 0 || index >= d.sfschemata.length) {
        rn.renderError(stateSetter, 'Invalid selection')
        return false;
    }

    ajax.getJSON(
        `/config/sfschema/${d.sfschemata[index].id}`, 
        function(data) {
            if (!data.b || !data.r) {
                rn.renderError(stateSetter, 'Can\'t access server!');
                return;
            }

            d.dm = data;
            if(callback instanceof Function) callback();
        },
        function(err) { rn.renderError(stateSetter, err.message) }
    );
}

const getSfConns = function(stateSetter, callback) {
    ajax.getJSON(
        `/config/sfconn`, 
        function(data) {
            if (!data.success) {
                rn.renderError(stateSetter, 'Can\'t access server!');
                return;
            }

            d.sfconns = data;
            if(callback instanceof Function) callback();
        },
        function(err) { rn.renderError(stateSetter, err.message) }
    );
}

const getSfConn = function(stateSetter, index, callback) {
    if (index < 0 || index >= d.sfconns.length) {
        rn.renderError(stateSetter, 'Invalid selection')
        return false;
    }

    ajax.getJSON(
        `/config/sfconn/${d.sfconns[index].id}`,
        function(data) {
            if (!data.success) {
                rn.renderError(stateSetter, 'Can\'t access server!');
                return;
            }

            d.sfconnconfig = data;
            if(callback instanceof Function) callback();
        },
        function(err) { rn.renderError(stateSetter, err.message) }
    );
}
