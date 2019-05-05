const d = require('../components/state');
const rn = require('../components/render');
const ajax = require('./ajaxfunctions');

module.exports.getSfConns = function(stateSetter, callback) {
    console.log('getSfConns');
    ajax.getJSON(
        stateSetter,
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
                    if (d.sfconfig.sfconns.selected === i) return;
                    d.sfconfig.sfconns.selected = i;
                    d.dm = null;
                    d.sfconfig.sfschemata.list = [];
                    d.sfconfig.sfschemata.selected = null;
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
        stateSetter,
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

module.exports.getSfSchemata = function(stateSetter, callback) {
    console.log('getting schemata');
    console.log(d.sfconfig);
    console.log(`/config/sfschema/${d.sfconfig.sfconns.list[d.sfconfig.sfconns.selected].id}`);
    ajax.getJSON(
        stateSetter,
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
                    if (d.sfconfig.sfschemata.selected === i) return;
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
        stateSetter,
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

            d.dm = JSON.parse(data.config);
            stateSetter(d);
            if(callback instanceof Function) callback();
        },
        function(err) { rn.renderError(stateSetter, err.message) }
    );
}
