const d = require('./data.js');
const mf = require('./mapfunctions.js');
const rf = require('./recarrayfunctions.js');
const rn = require('./render.js');

const updateRecord = function(rin, callback) {
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

    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: "/api/create",
      dataType: "json",
      async: true,
      //json object to sent to the authentication url
      data: JSON.stringify(apiObj),
      success: function(data) {
        if ( data.success === false || data.err ) {
          return;
        }

        if(callback) callback(data, rin);
      }
    });

  } else if ( !rec.new ) {
    let apiObj = {
      sobject: map.sobject,
      records: [{}],
    };

    apiObj.records[0].Id = rec.f.Id.value;
    for (let i in rec.f) {
      if(rec.f[i].value != rec.f[i].origval && !map.fields[i].noupdate) { apiObj.records[0][map.fields[i].sfname] = rec.f[i].value; }
    }

    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: "/api/update",
      dataType: "json",
      async: true,
      //json object to sent to the authentication url
      data: JSON.stringify(apiObj),
      success: function(data) {
        if ( data.success === false || data.err ) {
          return;
        }

        if(callback) callback(data);
      }
    });


  } else {
    rn.renderErr('Record is labelled new but has salesforce Id');
    return false;
  }

  return true;
}

const updateAll = function() {
  if( rf.allUnchanged() ) { 
    rn.renderError('Nothing to update!');
    return false; 
  }

  var ctr = 0;
  var total = 0;
  rn.renderLoadingStart();
  for( let i = 0; i < d.r.length; i++ ) {
    if ( !rf.isChanged(i) ) { 
      continue; 
    } else {
      total += 1;
    }
  }
  
  for ( let i = 0; i < d.r.length; i++ ) {
    updateRecord(i, function(){
      ctr += 1;
      if(ctr === total) {
        rn.renderLoadingEnd();
        sf.loadAllRecords();
      }
    });
  }

  return true;
};

module.exports.updateRecord = updateRecord;
module.exports.updateAll = updateAll;
