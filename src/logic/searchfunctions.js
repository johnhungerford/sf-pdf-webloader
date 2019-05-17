const d = require('../components/state.js');
const mf = require('./mapfunctions.js');
const rf = require('./recarrayfunctions.js');
const rn = require('../components/render.js');
const ajax = require('./ajaxfunctions');

const searchBase = function(stateSetter, rin) {
  if (d.r[rin].type != "search") {
    return false;
  }

  const bm = mf.getBorR(rin);
  let searchObj = {};
  /*
  body = {
      sobject: "",
      conditions: {
          SfField1: { $like: "%field1val%" },
          SfField2: { $like: "%field2val%" },
          SfField3: "field3val" //picklist
      },
      fields: {
          SfField4: 1,
  
      }
  }*/
  searchObj.sobject = bm.sobject;
  searchObj.conditions = {};
  searchObj.fields = {};
  for (let i in bm.fields) searchObj.fields[bm.fields[i].sfname] = 1;
  for (let j = 0; j < bm.settings.searchorder.length; j++) {
    let i = bm.settings.searchorder[j].field;
    if (d.r[rin].f[i].value) {
      if (bm.fields[i].type == "text") {
        searchObj.conditions[bm.fields[i].sfname] = {
          $like: "%" + d.r[rin].f[i].value.replace(/\s+/g, "%") + "%"
        };
      } else {
        searchObj.conditions[bm.fields[i].sfname] = d.r[rin].f[i].value;
      }
    }
  }

  const popupId = rn.renderLoadingStart(stateSetter, "Searching for " + bm.appname);
  ajax.postJSON(
    stateSetter,
    "/api/find",
    searchObj,
    (data) => {
      d.stage = 'searchbase';
      d.search = true;
      d.sdata = {
        type: "base",
        layout: bm.settings.searchlayout,
        sobject: searchObj.sobject,
        i: d.r[rin].bi,
        records: mf.convRecSA("base", d.r[rin].bi, data)
      };
      rn.renderLoadingEnd(stateSetter, popupId);
      stateSetter(d);
    },
    (err) => { 
      rn.renderLoadingEnd(stateSetter, popupId);
      rn.renderError(stateSetter, err.message) 
    }
  );

};

const clearBaseSearch = function(stateSetter) {
  d.search = false;
  d.sdata = { empty: true };
  d.stage = 'main';
};

const searchIndexRecord = function(stateSetter, rin, fin, indmap, value, callback) {
  var map = mf.getBorR(rin);
  var fm = map.fields[fin];
  if ( fm.type != 'index' ) { return false;}

  if (indmap instanceof Object && value != undefined && callback instanceof Function) {
    if (indmap.type !== 'index') return false;

    var searchObj = {
      sobject: indmap.indexto,
      conditions: {},
      fields: {
        Id: 1
      }
    };

    searchObj.conditions[indmap.indexshow] = {
      $like: "%" + value.replace(/\s\s+/g, "%") + "%",
    };
  
    for (var i in indmap.indexfields) {
      searchObj.fields[i] = 1;
    }
  } else {
    var searchObj = {
      sobject: fm.indexto,
      conditions: {},
      fields: {
        Id: 1
      }
    };
  
    searchObj.conditions[fm.indexshow] = {
      $like: "%" + d.r[rin].f[fin].showval.replace(/\s\s+/g, "%") + "%"
    };
  
    for (var i in fm.indexfields) {
      searchObj.fields[i] = 1;
    }
  }

  const popupId = rn.renderLoadingStart(stateSetter, "Searching for " + map.fields[fin].indexto);
  ajax.postJSON(
    stateSetter,
    "/api/find",
    searchObj,
    (data) => {
      rn.renderLoadingEnd(stateSetter, popupId);
      if (callback instanceof Function) {
        return rn.renderIndexSearch(stateSetter, rin, fin, data, indmap, callback); 
      }

      return rn.renderIndexSearch(stateSetter, rin, fin, data);
    },
    (err) => { 
      rn.renderLoadingEnd(stateSetter, popupId);
      rn.renderError(stateSetter, err.message) }
  );
};

const loadAllRecords = function(stateSetter, callback) {
  const popupId = rn.renderLoadingStart(stateSetter, "Loading all records");
  let loaded = 0;
  for (let i = 0; i < d.dm.b.length; i++) {
    if (!d.r[i].f.Id.value) continue;

    let searchObj = {
      sobject: d.dm.b[i].sobject,
      conditions: {},
      fields: {}
    };

    searchObj.conditions.Id = d.r[i].f.Id.value;
    for (let j in d.dm.b[i].fields) {
      searchObj.fields[d.dm.b[i].fields[j].sfname] = 1;
      if (d.dm.b[i].fields[j].value) {
        searchObj.conditions[d.dm.b[i].fields[j].sfname] =
          d.dm.b[i].fields[j].value;
      }
    }

    ajax.postJSON(
      stateSetter,
      "/api/find",
      searchObj,
      (data) => {
        loaded += 1;
        if (data) {
          for (let l in data) {
            rf.addBaseRecord(stateSetter, i, data[l]);
          }
        }
        
        if (loaded === d.dm.b.length + d.dm.r.length) {
          for (let k = 0; k < d.r.length; k++) {
            if (d.r[k].new) d.r.splice(k, 1);
            if (d.ri >= d.r.length) {
              d.ri = d.r.length - 1;
              d.fi = d.r[d.ri].order[0];
            }
          }

          rn.renderLoadingEnd(stateSetter, popupId)
          rf.updateIndexFields(stateSetter, () => {
            rf.orderR();
            if (d.r[d.ri].f[d.fi] === undefined) d.fi = d.r[d.ri].order[0];
            stateSetter(d);
            if(callback && typeof(callback) === 'function') callback();
          });
        }
      },
      (err) => { 
        if (callback) return callback({ success: false, message: err });
      }
    );
  }


  let rlen = d.dm.r.length;
  for (let i = 0; i < rlen; i++) {
    let searchObj = {
      sobject: d.dm.r[i].sobject,
      conditions: {},
      fields: {}
    };

    for (let j in d.dm.r[i].fields) {
      searchObj.fields[d.dm.r[i].fields[j].sfname] = 1;
      if (d.dm.r[i].fields[j].value) {
        searchObj.conditions[d.dm.r[i].fields[j].sfname] =
          d.dm.r[i].fields[j].value;
      } else if (d.dm.r[i].fields[j].inherits) {
        for (let k in d.r) {
          if (d.r[k].bi == d.dm.r[i].fields[j].inherits.base) {
            searchObj.conditions[d.dm.r[i].fields[j].sfname] =
              d.r[k].f[d.dm.r[i].fields[j].inherits.field].value;
          }
        }
      }
    }

    ajax.postJSON(
      stateSetter,
      "/api/find",
      searchObj,
      (data) => {
        loaded += 1;
        if (data) {
          for (let l in data) {
            rf.addRecord(stateSetter, i, data[l]);
          }
        }

        if (loaded === d.dm.b.length + d.dm.r.length) {
          for (let k = 0; k < d.r.length; k++) {
            if (d.r[k].new) d.r.splice(k, 1);
            if (d.ri >= d.r.length) {
              d.ri = d.r.length - 1;
              d.fi = d.r[d.ri].order[0];
            }
          }

          rn.renderLoadingEnd(stateSetter, popupId);
          rf.updateIndexFields(stateSetter, () => {
            rf.orderR();
            if (d.r[d.ri].f[d.fi] === undefined) d.fi = d.r[d.ri].order[0];
            stateSetter(d);
            if(callback && typeof(callback) === 'function') callback();
          });
        }
      },
      (err) => { 
        if (callback) return callback({ success: false, message: err });
      }
    );
  }
};

const indexSearchSelected = function(stateSetter, rin, fin, record) {
  if (!record.Id) {
    return false;
  }

  rf.setValue(stateSetter, rin, fin, record.Id);
  const fm = mf.getFm(rin, fin);
  if (!record[fm.indexshow]) {
    return false;
  }

  d.r[rin].f[fin].showval = record[fm.indexshow];
  rf.nextf();
  return true;
};

const baseSearchSelected = function(stateSetter, id) {
  let bRec = {};
  for (let i in d.sdata.records) {
    if (d.sdata.records[i].Id === id) {
      bRec = d.sdata.records[i];
    }
  }

  if (!bRec.Id) {
    return false;
  }

  rf.addBaseRecord(stateSetter, d.sdata.i, bRec);
  return;
};

const recordSearchSelected = function(stateSetter, id) {
  let rec = {};
  for (let i in d.sdata.records) {
    if (d.sdata.records[i].Id === id) {
      rec = d.sdata.records[i];
    }
  }

  if (!rec.Id) {
    return false;
  }

  rf.addRecord(stateSetter, d.sdata.i, record);
  stateSetter(d);
  return;
};

module.exports.searchBase = searchBase;
module.exports.clearBaseSearch = clearBaseSearch;
module.exports.searchIndexRecord = searchIndexRecord;
module.exports.loadAllRecords = loadAllRecords;
module.exports.indexSearchSelected = indexSearchSelected;
module.exports.baseSearchSelected = baseSearchSelected;
module.exports.recordSearchSelected = recordSearchSelected;
