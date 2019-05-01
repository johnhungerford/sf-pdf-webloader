const d = require('./data.js');
const mf = require('./mapfunctions.js');
const rf = require('./recarrayfunctions.js');
const rn = require('./render.js');
const sf = require('./searchfunctions.js');
const ajax = require('./ajaxfunctions');

const updateRecord = function(stateSetter, rin, callback) {
  if ( !rf.isChanged(rin) ) { return false; }

  let map = mf.getBorR(rin);
  let rec = d.r[rin];
  if ( rec.new && !rec.f.Id.value ) {
    let apiObj = {
      sobject: map.sobject,
      records: [{}],
    };

    for (let i in rec.f) {
      if ( rec.f[i].value && rec.f[i].sfname != "Id" && !map.fields[i].noupdate) {
        apiObj.records[0][map.fields[i].sfname] = rec.f[i].value;
      }
    }

    ajax.postJSON(
      "/api/create",
      apiObj,
      function(data) {
        if ( data.success === false || data.err ) {
          return;
        }

        if(callback) callback(data, rin);
      },
      function(err) { rn.renderErr(stateSetter, err.message) }
    );

  } else if ( !rec.new ) {
    let apiObj = {
      sobject: map.sobject,
      records: [{}],
    };

    apiObj.records[0].Id = rec.f.Id.value;
    for (let i in rec.f) {
      if(rec.f[i].value != rec.f[i].origval && !map.fields[i].noupdate) { apiObj.records[0][map.fields[i].sfname] = rec.f[i].value; }
    }

    ajax.postJSON(
      "/api/update",
      apiObj,
      function(data) {
        if ( data.success === false || data.err ) {
          return;
        }

        if(callback) callback(data);
      },
      function(err) { stateSetter, err.message }
    );


  } else {
    rn.renderErr(stateSetter, 'Record is labelled new but has salesforce Id');
    return false;
  }

  return true;
}

const updateAll = function(stateSetter, ) {
  if( rf.allUnchanged() ) { 
    rn.renderErr(stateSetter, 'Nothing to update!');
    return false; 
  }

  var ctr = 0;
  var total = 0;
  rn.renderLoadingStart(stateSetter);
  for( let i = 0; i < d.r.length; i++ ) {
    if ( !rf.isChanged(i) ) { 
      continue; 
    } else {
      total += 1;
    }
  }
  
  for ( let i = 0; i < d.r.length; i++ ) {
    updateRecord(stateSetter, i, function(){
      ctr += 1;
      if(ctr === total) {
        rn.renderLoadingEnd(stateSetter);
        sf.loadAllRecords(stateSetter);
      }
    });
  }

  return true;
};

module.exports.updateRecord = updateRecord;
module.exports.updateAll = updateAll;
