const searchBase = function(rin) {
  if (r[rin].type != "search") {
    return false;
  }

  const bm = getBorR(rin);
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
  for (let i in bm.fields) {
    searchObj.fields[bm.fields[i].sfname] = 1;
    if (bm.fields[i].search && r[rin].f[i].value) {
      if (bm.fields[i].type == "text") {
        searchObj.conditions[bm.fields[i].sfname] = {
          $like: "%" + r[rin].f[i].value.replace(/\s+/g, "%") + "%"
        };
      } else {
        searchObj.conditions[bm.fields[i].sfname] = r[rin].f[i].value;
      }
    }
  }

  renderLoadingStart("Searching for " + bm.appname);
  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: "/api/find",
    dataType: "json",
    async: true,
    //json object to sent to the authentication url
    data: JSON.stringify(searchObj),
    success: function(data) {
      search = true;
      sdata = {
        type: "base",
        layout: bm.settings.searchlayout,
        sobject: searchObj.sobject,
        i: r[rin].bi,
        records: convRecSA("base", r[rin].bi, data)
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
      renderLoadingEnd();
      renderSfView();
    }
  });

};

const clearBaseSearch = function() {
  search = false;
  sdata = { empty: true };
  renderSfView();
};

const searchIndexRecord = function(rin, fin) {
  if (r[rin].type != "record" ) {
    return false;
  }

  var map = getBorR(rin, fin);
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
    $like: "%" + r[rin].f[fin].showval.replace(/\s\s+/g, "%") + "%"
  };

  for (var i in fm.indexfields) {
    searchObj.fields[i] = 1;
  }

  renderLoadingStart("Searching for " + map.fields[fin].indexto);
  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: "/api/find",
    dataType: "json",
    async: true,
    //json object to sent to the authentication url
    data: JSON.stringify(searchObj),
    success: function(data) {
      renderLoadingEnd();
      return renderIndexSearch(rin, fin, data);
    }
  });
};

const loadAllRecords = function(callback) {
  renderLoadingStart("Loading all records");
  let loaded = 0;
  if(r.length > dm.b.length) {
    let len = r.length;
    for (let i = dm.b.length; i < len; i++) r.pop();
  }

  for (let i = 0; i < dm.b.length; i++) {
    if (!r[i].f.Id.value) continue;

    let searchObj = {
      sobject: dm.b[i].sobject,
      conditions: {},
      fields: {}
    };

    searchObj.conditions.Id = r[i].f.Id.value;
    for (let j in dm.b[i].fields) {
      searchObj.fields[dm.b[i].fields[j].sfname] = 1;
      if (dm.b[i].fields[j].value) {
        searchObj.conditions[dm.b[i].fields[j].sfname] =
          dm.b[i].fields[j].value;
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
            addBaseRecord(i, data[l]);
          }
        }
        
        if (loaded === dm.b.length + dm.r.length) {
          orderR();
          updateIndexFields(() => {
            renderFldEntry();
            renderSfView();
            if(callback && typeof(callback) === 'function') callback();
          });
        }
      }
    });
  }


  let rlen = dm.r.length;
  for (let i = 0; i < rlen; i++) {
    let searchObj = {
      sobject: dm.r[i].sobject,
      conditions: {},
      fields: {}
    };

    for (let j in dm.r[i].fields) {
      searchObj.fields[dm.r[i].fields[j].sfname] = 1;
      if (dm.r[i].fields[j].value) {
        searchObj.conditions[dm.r[i].fields[j].sfname] =
          dm.r[i].fields[j].value;
      } else if (dm.r[i].fields[j].inherits) {
        for (let k in r) {
          if (r[k].bi == dm.r[i].fields[j].inherits.base) {
            searchObj.conditions[dm.r[i].fields[j].sfname] =
              r[k].f[dm.r[i].fields[j].inherits.field].value;
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
            addRecord(i, data[l]);
          }
        }

        if (loaded === dm.b.length + dm.r.length) {
          orderR();
          updateIndexFields(() => {
            renderFldEntry();
            renderSfView();
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

  setValue(rin, fin, record.Id);
  const fm = getFm(rin, fin);
  if (!record[fm.indexshow]) {
    return false;
  }

  r[rin].f[fin].showval = record[fm.indexshow];
  nextf();
  renderFldEntry();
  return true;
};

const baseSearchSelected = function(id) {
  let bRec = {};
  for (let i in sdata.records) {
    if (sdata.records[i].Id === id) {
      bRec = sdata.records[i];
    }
  }

  if (!bRec.Id) {
    return false;
  }

  addBaseRecord(sdata.i, bRec);
  return;
};

const recordSearchSelected = function(id) {
  let rec = {};
  for (let i in sdata.records) {
    if (sdata.records[i].Id === id) {
      rec = sdata.records[i];
    }
  }

  if (!rec.Id) {
    return false;
  }

  addRecord(sdata.i, record);
  renderSfView();
  renderFldEntry();
  return;
};
