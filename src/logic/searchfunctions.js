const d = require('./state.js');
const mf = require('./mapfunctions.js');
const rf = require('./recarrayfunctions.js');
const rn = require('./render.js');
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

  rn.renderLoadingStart(stateSetter, "Searching for " + bm.appname);
  ajax.postJSON(
    "/api/find",
    searchObj,
    function(data) {
      d.search = true;
      d.sdata = {
        type: "base",
        layout: bm.settings.searchlayout,
        sobject: searchObj.sobject,
        i: d.r[rin].bi,
        records: mf.convRecSA("base", d.r[rin].bi, data)
      };

      $(document).on("searchSelect", function(e) {
        if (!e) {
          return false;
        }
        if (e.Id ) {
          baseSearchSelected(stateSetter, e.Id);
        } else {
          return;
        }
      });
      rn.renderLoadingEnd(stateSetter);
      stateSetter(d);
    },
    function(err) { rn.renderError(stateSetter, err.message) }
  );

};

const clearBaseSearch = function(stateSetter) {
  d.search = false;
  d.sdata = { empty: true };
  rn.renderSfView(stateSetter);
};

const searchIndexRecord = function(stateSetter, rin, fin) {
  var map = mf.getBorR(rin);
  var fm = map.fields[fin];

  if ( fm.type != 'index' ) { return false;}

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

  rn.renderLoadingStart(stateSetter, "Searching for " + map.fields[fin].indexto);
  ajax.postJSON(
    "/api/find",
    searchObj,
    function(data) {
      rn.renderLoadingEnd(stateSetter);
      return rn.renderIndexSearch(stateSetter, rin, fin, data);
    },
    function(err) { rn.renderError(stateSetter, err.message) }
  );
};

const loadAllRecords = function(stateSetter, callback) {
  rn.renderLoadingStart(stateSetter, "Loading all records");
  let loaded = 0;
  if(d.r.length > d.dm.b.length) {
    let len = d.r.length;
    for (let i = d.dm.b.length; i < len; i++) d.r.pop();
  }

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
      url: "/api/find",
      searchObj,
      function(data) {
        loaded += 1;
        if (data) {
          for (let l in data) {
            rf.addBaseRecord(stateSetter, i, data[l]);
          }
        }
        
        if (loaded === d.dm.b.length + d.dm.r.length) {
          rf.orderR();
          rf.updateIndexFields(stateSetter, () => {
            stateSetter(d);
            if(callback && typeof(callback) === 'function') callback();
          });
        }
      },
      function(err) { stateSetter, err.message }
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
      "/api/find",
      searchObj,
      function(data) {
        loaded += 1;
        if (data) {
          for (let l in data) {
            rf.addRecord(stateSetter, i, data[l]);
          }
        }

        if (loaded === d.dm.b.length + d.dm.r.length) {
          rf.orderR();
          rf.updateIndexFields(stateSetter, () => {
            stateSetter(d);
            if(callback && typeof(callback) === 'function') callback();
          });
        }

        return true;
      },
      function(err) { stateSetter, err.message }
    );
  }
};

const indexSearchSelected = function(stateSetter, rin, fin, record) {
  if (!record.Id) {
    return false;
  }

  rf.setValue(rin, fin, record.Id);
  const fm = mf.getFm(rin, fin);
  if (!record[fm.indexshow]) {
    return false;
  }

  d.r[rin].f[fin].showval = record[fm.indexshow];
  rf.nextf();
  stateSetter(d);
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
