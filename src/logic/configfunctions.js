const React = require('react');
const SchemaConfigure = require('../components/schemaconfigure/SchemaConfigure').default;
const d = require('../components/state');
const rn = require('../components/render');
const ajax = require('./ajaxfunctions');

module.exports.getSfConns = function(stateSetter, callback) {
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
            for (let i = d.sfconfig.sfconns.list.length-1; i >= 0; i--) {
                if (d.sfconfig.sfconns.list[i].title === 'Sample Connection' &&
                i !== d.sfconfig.sfconns.list.length-1) {
                    const tmp = d.sfconfig.sfconns.list[i]
                    for (let j = i + 1; j < d.sfconfig.sfconns.list.length; j++) {
                        d.sfconfig.sfconns.list[j - 1] = d.sfconfig.sfconns.list[j];
                    }

                    d.sfconfig.sfconns.list[d.sfconfig.sfconns.list.length-1] = tmp;
                }
            }

            for (let i in d.sfconfig.sfconns.list) {
                if (d.sfconfig.sfconns.list[i].id === data.default) {
                    d.sfconfig.sfconns.selected = i;
                    module.exports.getSfSchemata(stateSetter);
                }

                d.sfconfig.sfconns.list[i].handler = (e) => {
                    if (d.sfconfig.sfconns.selected === i) return;
                    d.sfconfig.sfconns.selected = i;
                    d.dm = null;
                    d.ri = null;
                    d.fi = null;
                    d.stage = 'off';
                    d.sfconfig.sfschemata.list = [];
                    d.sfconfig.sfschemata.selected = null;
                    module.exports.getSfSchemata(stateSetter);
                }
            }
            
            d.sfconfig.sfconns.list.push({
                title: 'Add New Connection',
                id: 'AddNewConnection',
                handler: () => {
                    rn.renderAddConnection(stateSetter);
                }
            })
            stateSetter(d);
            console.log(`d.sfconfig.sfconns.selected: ${d.sfconfig.sfconns.selected}`);

            if(callback instanceof Function) callback(data);
        },
        function(err) { 
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
        function(err) { 
            rn.renderError(stateSetter, err.message) 
        }
    );
}

module.exports.getSfSchemata = function(stateSetter, callback) {
    ajax.getJSON(
        stateSetter,
        `/config/sfschema/${d.sfconfig.sfconns.list[d.sfconfig.sfconns.selected].id}`, 
        function(data) {
            if (!data.success) {
                rn.renderError(stateSetter, 'Can\'t access server!');
                return;
            }

            d.sfconfig.sfschemata.selected = null;
            d.sfconfig.sfschemata.list = data.list;
            for (let i = d.sfconfig.sfschemata.list.length - 1; i >= 0; i--) {
                if (d.sfconfig.sfschemata.list[i].title === 'Sample Schema Config' &&
                    i !== d.sfconfig.sfschemata.list.length-1) {
                    const tmp = d.sfconfig.sfschemata.list[i]
                    for (let j = i + 1; j < d.sfconfig.sfschemata.list.length; j++) {
                        d.sfconfig.sfschemata.list[j - 1] = d.sfconfig.sfschemata.list[j];
                    }

                    d.sfconfig.sfschemata.list[d.sfconfig.sfschemata.list.length-1] = tmp;
                }
            }

            for (let i in d.sfconfig.sfschemata.list) {
                if (data.default !== null && d.sfconfig.sfschemata.list[i].id === data.default) {
                    d.sfconfig.sfschemata.selected = i;
                    if (data.dm) d.dm = JSON.parse(data.dm);
                }

                d.sfconfig.sfschemata.list[i].handler = (e) => {
                    if (d.sfconfig.sfschemata.selected === i) return;
                    d.sfconfig.sfschemata.selected = i;
                    d.dm = null;
                    d.ri = null;
                    d.fi = null;
                    d.stage = 'off';
                    module.exports.getDm(stateSetter);
                }
            }

            d.sfconfig.sfschemata.list.push({
                title: 'Add New Configuration',
                id: 'AddNewConfig',
                handler: () => {
                    d.popups.push((
                        <SchemaConfigure 
                            keyprop={`schema-config-${d.popups.length}`}
                            stateSetter={stateSetter}
                            hash={'schemahash' + Math.random().toString(36).substring(7)}
                        />
                    ));
                    stateSetter(d);
                }
            })
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
            d.stage = 'off';
            stateSetter(d);
            if(callback instanceof Function) callback();
        },
        function(err) { 
            rn.renderError(stateSetter, err.message) 
        }
    );
}

module.exports.createConnection = function(stateSetter, config, title, isDefault, callback) {
    ajax.postJSON(
        stateSetter,
        `/config/addsfconn/`, 
        {
            title: title,
            config: JSON.stringify(config),
            default: isDefault,
        },
        function(data) {
            if (!data.success) {
                rn.renderError(stateSetter, 'Failed to create connection configuration' + data.message);
                return;
            }

            module.exports.getSfConns(stateSetter, ()=>{
                if(callback instanceof Function) callback();
            })
        },
        function(err) { 
            rn.renderError(stateSetter, err.message); 
        }
    );
}
