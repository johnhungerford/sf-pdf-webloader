var updateRecord = function(rin, callback) {
  if ( !isChanged(rin) ) { return false; }

  let map = getBorR(rin);
  let rec = r[rin];
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
    renderErr('Record is labelled new but has salesforce Id');
    return false;
  }

  return true;
}

var updateAll = function() {
  if( allUnchanged() ) { 
    renderError('Nothing to update!');
    return false; 
  }

  var ctr = 0;
  var total = 0;
  renderLoadingStart();
  for( let i = 0; i < r.length; i++ ) {
    if ( !isChanged(i) ) { 
      continue; 
    } else {
      total += 1;
    }
  }
  
  for ( let i = 0; i < r.length; i++ ) {
    updateRecord(i, function(){
      ctr += 1;
      if(ctr === total) {
        renderLoadingEnd();
        loadAllRecords();
      }
    });
  }

  return true;
};
