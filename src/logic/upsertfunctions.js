const d = require('../components/state');
const mf = require('./mapfunctions.js');
const rf = require('./recarrayfunctions.js');
const rn = require('../components/render');
const sf = require('./searchfunctions.js');
const ajax = require('./ajaxfunctions');

const updateRecord = function(stateSetter, rin, callback) {
  if (d.r[rin].delete) {
    const fm = mf.getBorR(rin);
    console.log(`Record to delete!!:`);
    console.log(d.r[rin]);
    ajax.postJSON(
      stateSetter,
      "/api/delete",
      {
        Id: d.r[rin].f.Id.value,
        sObject: fm.sobject,
      },
      (data) => {
        if (data.success) {
          d.r.splice(rin,1);
          if (d.ri >= rin) {
            d.r.splice(this.props.ri,1);
            if (d.ri >= this.props.ri) rf.prevrNoAdd();
            this.props.stateSetter(d);
            return;
          }
        }

        if (callback) callback(data);
      },
      (err) => { 
        rn.renderErr(stateSetter, err.message);
        if (callback) callback({success: false, err: err}, rin);
      }
    );

    return;
  }

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
      stateSetter,
      "/api/create",
      apiObj,
      (data) => {
        if (callback) callback(data, rin);
      },
      (err) => { 
        rn.renderErr(stateSetter, err.message);
        if (callback) callback({success: false, err: err}, rin);
      }
    );

    return;
  } 
  
  if ( !rec.new ) {
    let apiObj = {
      sobject: map.sobject,
      records: [{}],
    };

    apiObj.records[0].Id = rec.f.Id.value;
    for (let i in rec.f) {
      if(rec.f[i].value != rec.f[i].origval && !map.fields[i].noupdate) { apiObj.records[0][map.fields[i].sfname] = rec.f[i].value; }
    }

    ajax.postJSON(
      stateSetter,
      "/api/update",
      apiObj,
      (data) => {
        if(callback) callback(data);
      },
      (err) => { 
        rn.renderError(stateSetter, err);
        if (callback) callback({success: false, err: err}, rin);
      }
    );

    return;
  } 
    
  rn.renderErr(
    stateSetter, 
    'Record is labelled new but has salesforce Id. Press continue to change "new" status to false and try again.',
    () => {
      d.r[rin].new = false;
      updateRecord(stateSetter, rin, callback);
    } 
  );
  return false;
}

const updateAll = function(stateSetter) {
  if( rf.allUnchanged() ) { 
    rn.renderAlert(stateSetter, 'Nothing to update!');
    return false; 
  }

  let ctr = 0;
  let total = 0;
  rn.renderLoadingStart(stateSetter, 'Saving all records');
  for( let i = 0; i < d.r.length; i++ ) {
    if ( !rf.isChanged(i) && !d.r[i].delete ) { 
      continue; 
    } else {
      total += 1;
    }
  }
  
  for ( let i = 0; i < d.r.length; i++ ) {
    updateRecord(stateSetter, i, () => {
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
