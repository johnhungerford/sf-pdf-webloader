const d = require('./data.js');
const mf = require('./mapfunctions.js');
const rf = require('./recarrayfunctions.js');
const rn = require('./render.js');

const searchBase = function(rin) {
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

  rn.renderLoadingStart("Searching for " + bm.appname);
  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: "/api/find",
    dataType: "json",
    async: true,
    //json object to sent to the authentication url
    data: JSON.stringify(searchObj),
    success: function(data) {
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
          baseSearchSelected(e.Id);
        } else {
          return;
        }
      });
      rn.renderLoadingEnd();
      rn.renderSfView();
    }
  });

};

const clearBaseSearch = function() {
  d.search = false;
  d.sdata = { empty: true };
  rn.renderSfView();
};

const searchIndexRecord = function(rin, fin) {
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

  rn.renderLoadingStart("Searching for " + map.fields[fin].indexto);
  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: "/api/find",
    dataType: "json",
    async: true,
    //json object to sent to the authentication url
    data: JSON.stringify(searchObj),
    success: function(data) {
      rn.renderLoadingEnd();
      return rn.renderIndexSearch(rin, fin, data);
    }
  });
};

const loadAllRecords = function(callback) {
  rn.renderLoadingStart("Loading all records");
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

    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: "/api/find",
      dataType: "json",
      async: true,
      //json object to sent to the authentication url
      data: JSON.stringify(searchObj),
      success: function(data) {
        loaded += 1;
        if (data) {
          for (let l in data) {
            rf.addBaseRecord(i, data[l]);
          }
        }
        
        if (loaded === d.dm.b.length + d.dm.r.length) {
          rf.orderR();
          rf.updateIndexFields(() => {
            rn.renderFldEntry();
            rn.renderSfView();
            if(callback && typeof(callback) === 'function') callback();
          });
        }
      }
    });
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
        for (let k in r) {
          if (d.r[k].bi == d.dm.r[i].fields[j].inherits.base) {
            searchObj.conditions[d.dm.r[i].fields[j].sfname] =
              d.r[k].f[d.dm.r[i].fields[j].inherits.field].value;
          }
        }
      }
    }

    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: "/api/find",
      dataType: "json",
      async: true,
      //json object to sent to the authentication url
      data: JSON.stringify(searchObj),
      success: function(data) {
        loaded += 1;
        if (data) {
          for (let l in data) {
            rf.addRecord(i, data[l]);
          }
        }

        if (loaded === d.dm.b.length + d.dm.r.length) {
          rf.orderR();
          rf.updateIndexFields(() => {
            rn.renderFldEntry();
            rn.renderSfView();
            if(callback && typeof(callback) === 'function') callback();
          });
        }

        return true;
      }
    });
  }
};

const indexSearchSelected = function(rin, fin, record) {
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
  rn.renderFldEntry();
  return true;
};

const baseSearchSelected = function(id) {
  let bRec = {};
  for (let i in d.sdata.records) {
    if (d.sdata.records[i].Id === id) {
      bRec = d.sdata.records[i];
    }
  }

  if (!bRec.Id) {
    return false;
  }

  rf.addBaseRecord(d.sdata.i, bRec);
  return;
};

const recordSearchSelected = function(id) {
  let rec = {};
  for (let i in d.sdata.records) {
    if (d.sdata.records[i].Id === id) {
      rec = d.sdata.records[i];
    }
  }

  if (!rec.Id) {
    return false;
  }

  rf.addRecord(d.sdata.i, record);
  rn.renderSfView();
  rn.renderFldEntry();
  return;
};

module.exports.searchBase = searchBase;
module.exports.clearBaseSearch = clearBaseSearch;
module.exports.searchIndexRecord = searchIndexRecord;
module.exports.loadAllRecords = loadAllRecords;
module.exports.indexSearchSelected = indexSearchSelected;
module.exports.baseSearchSelected = baseSearchSelected;
module.exports.recordSearchSelected = recordSearchSelected;
