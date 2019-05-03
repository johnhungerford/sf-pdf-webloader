const d = require('../components/state');
const rn = require('../components/render');
const ajax = require('./ajaxfunctions');

/**
 * This ajax call gets everything started: it pulls the document map (a json config file) from
 * the server, sets it up as a global variable, and calls getDocs() to grab the list of pdfs
 * stored on the server. 
 */

module.exports.getSfSchemata = function(stateSetter, callback) {
    console.log('getting schemata');
    console.log(d.sfconfig);
    console.log(`/config/sfschema/${d.sfconfig.sfconns.list[d.sfconfig.sfconns.selected].id}`);
    ajax.getJSON(
        `/config/sfschema/${d.sfconfig.sfconns.list[d.sfconfig.sfconns.selected].id}`, 
        function(data) {
            if (!data.success) {
                rn.renderError(stateSetter, 'Can\'t access server!');
                return;
            }

            d.sfconfig.sfschemata.list = data.list;
            if (data.list.length === 0) d.sfconfig.sfschemata.selected = null;
            for (let i in d.sfconfig.sfschemata.list) {
                d.sfconfig.sfschemata.list[i].handler = (e) => {
                    d.sfconfig.sfschemata.selected = i;
                    module.exports.getDm(stateSetter);
                }
            }
            stateSetter(d);
            if(callback instanceof Function) callback();
        },
        function(err) {
            rn.renderError(stateSetter, err.message);
        }
    );
}

module.exports.getDm = function(stateSetter, callback) {
    const index = d.sfconfig.sfschemata.selected;
    if (index < 0 || index >= d.sfconfig.sfschemata.list.length) {
        rn.renderError(stateSetter, 'Invalid selection')
        return false;
    }

    console.log(`/config/sfschema/${d.sfconfig.sfschemata.list[index].id}`);
    ajax.getJSON(
        `/config/sfschema/${d.sfconfig.sfconns.list[d.sfconfig.sfconns.selected].id}/${d.sfconfig.sfschemata.list[index].id}`, 
        function(data) {
            if (!data.success) {
                rn.renderError(stateSetter, 'Failed to retrieve config' + data.message);
                return;
            }

            if (!data.config) {
                rn.renderError(stateSetter, 'No config file delivered...');
                return;
            }

            d.dm = data.config;
            stateSetter(d);
            if(callback instanceof Function) callback();
        },
        function(err) { rn.renderError(stateSetter, err.message) }
    );
}

module.exports.getSfConns = function(stateSetter, callback) {
    console.log('getSfConns');
    ajax.getJSON(
        `/config/sfconn`, 
        function(data) {
            if (!data.success) {
                rn.renderError(stateSetter, 'Can\'t access server!');
                return;
            }

            d.sfconfig.sfconns.list = data.list;
            d.sfconfig.sfconns.selected = null;
            d.sfconfig.queryconns = false;
            for (let i in d.sfconfig.sfconns.list) {
                d.sfconfig.sfconns.list[i].handler = (e) => {
                    d.sfconfig.sfconns.selected = i;
                    module.exports.getSfSchemata(stateSetter);
                }
            }
            stateSetter(d);
            console.log(d.sfconfig);

            if(callback instanceof Function) callback(data);
        },
        function(err) { 
            console.log('was there an error??');
            console.log(err, err.message);
            rn.renderError(stateSetter, err.message); 
        }
    );
}

module.exports.getSfConn = function(stateSetter, index, callback) {
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
