const renderDoc = function(site) {

  $('.pdfwin').empty();

  if(site === undefined) {
    $(".pdfwin").append('<iframe id="pdfiframe" height="100%" width="100%" src="/doc/view"></iframe>');
  } else {
    $(".pdfwin").append('<iframe id="pdfiframe" height="100%" width="100%" src="'+site+'"></iframe>');
  }

  $('#pdfiframe').on('load', function () {
    
    $("#pdfiframe")
      .contents()
      .find("body")
      .off()
      .mouseup(function(e) {
        let doc = document.getElementById("pdfiframe").contentDocument;
        let selec = doc.getSelection();
        let txt = selec.toString();
        if(!txt) { return; }

        if(mdownpos === []) mdownpos = [e.pageX, e.pageY];
        
        if(!validateSelection(txt)) {
          renderSelectionErr(selec);
          return;
        }

        $(".fldinput").val(txt);
        $(".fldinput").change();
        selec.collapseToStart();
        $('.fldwin').attr("tabindex",-1).focus();
        mdownpos = [];
      });

    $('#pdfiframe').contents().find('body').mousedown(function (e) {
      mdownpos = [e.pageX, e.pageY];
    });
  
  });
  
};

const renderSelectionErr = function(selec) {
  const $mainwin = $('.mainwin');
  const $iframe = $('#pdfiframe');
  $mainwin.append('<div id="selecpopup" style="position:absolute;display:none;z-index:100;background-color:light red;">Invalid selection for field: '+r[ri].f[fi].sfname+'</div>');
  const $popup = $('#selecpopup');
  $('#popup').offset({ top: $iframe.position().top + mdownpos[1], left: $iframe.position().left + mdownpos[0]}).show();
  setTimeout(4000, ()=>{
    $('#popup').remove();
  });


}

var renderError = function(msg) {
  $(".error-body").empty();
  $(".error-body").append(msg);
  $(".error").modal("show");
};

var renderAlert = function(msg, callback) {
  $(".alert-body").empty();
  $(".alert-body").append(msg);
  $(".alert").modal("show");
  $('.alert-execute').off().click(function () {
    $('.alert').modal('hide');
    if(callback) { callback(); }
  });
};

var renderOpenUrl = function() {
  $('.openurl-input').val('');
  $('.openurlmodal').modal('show');
  $('.openurl-open-btn').off().click(function () {
    $('.openurlmodal').modal('hide');
    renderDoc($('.openurl-input').val());
  });
};

var renderLoadingStart = function(msg) {

  $('.ld-msg').empty();
  $('.ld-msg').append(msg);
  $('.loading').modal('show');
  setTimeout(function () {
    renderLoadingEnd();
  }, 10000);

}

var renderLoadingEnd = function() {

  setTimeout(function() {
    $('.loading').modal('hide');
  }, 200);
  $('.ld-msg').empty();
  

}

var renderBaseSearch = function() {
  var map = getBorR();

  var riloc = ri;
  var filoc = fi;

  $(".sfviewmenu").empty();

  if ( r[ri].type == 'search' ) {
    $(".sfviewmenu").append(
      '<button type="button" class="btn btn-primary newbase-button">New</button'
    );

    $(".newbase-button").off().click(function() {
      r[riloc].type = 'base';
      setOrder(riloc);
      fi = r[riloc].order[0];
      renderFldEntry();
      renderSfView();
    });

    $(".sfviewbody").empty();
    $(".sfviewbody").append(
      "<h4>Find or Create " + map.appname + " (" + map.sobject + ")</h4>"
    );

    if (sdata.empty) {
      return false;
    }

    for (let i = 0; i < sdata.records.length; i++) {
      $(".sfviewbody").append(
        '<div class="search-result" data-id="' +
          sdata.records[i]["Id"] +
          '" id="sresult' +
          i +
          '"></div>'
      );
      for (var j in sdata.layout) {
        $("#sresult" + i).append(
          "<div>" + parseLayout(sdata.layout[j], sdata.records[i]) + "</div>"
        );
      }
      $("#sresult" + i).off().click(function() {
        $.event.trigger({
          type: "searchSelect",
          Id: sdata.records[i]["Id"]
        });
      });
    }
  } else {
    $(".sfviewmenu").append(
      '<button type="button" class="btn btn-primary createbase-button">Add to Salesforce</button'
    );

    $(".createbase-button").off().click(function() {
      renderLoadingStart();
      updateRecord(riloc, function(data, rin){
        renderLoadingEnd();
        console.log('Created contact record!');
        console.log(data);
        console.log(rin);
        if(data[0]) {
          if(data[0].id) {
            setValue(rin, 'Id', data[0].id);
            r[rin].new = false;
            loadAllRecords();
          }
        }
      });
    });

    $(".sfviewbody").empty();
    $(".sfviewbody").append(
      "<h4>Add " + map.appname + " (" + map.sobject + ") to Salesforce</h4>"
    );
  }  
  
};

/*var renderSfViewDocs = function() {

  $(".sfviewmenu").empty();

  $(".sfviewmenu").append(
    '<span class="btn btn-primary file-input-span" style="margin-right:5px">Upload PDF<input type="file" class="file-input></span>'
  );

  $('.file-input').change(function() {
    addDoc('top',function() {
      di = d.length-1;
      addSearchRecords();
      renderDoc();
      renderSfView();
      renderFldEntry();
    });
  });

  $(".sfviewbody").empty();

  for( var i = 0; i < d.length; i++ ) {
    $(".sfviewbody").append('<div class="doclist-entry"><span class="span-link" id="doc-' + i + '">Document '+ i+1 +'</div>');
    $('#doc-'+i).click(function() {
      di = i;
      renderDoc();
      renderSfView();
      renderFldEntry();
    });
  }

}*/

var renderSfView = function() {

  /*if (init) {
    $(".sfviewmenu").empty();
    $(".sfviewbody").empty();
    return;
  }*/

  if (search) {
    return renderBaseSearch();
  }

  if( ri >= r.length ) ri = r.length-1;
  if( ri < 0 ) ri = 0;

  $(".sfviewmenu").empty();

  $(".sfviewmenu").append(
    '<button type="button" class="btn btn-primary saveall-button" style="margin-right:5px;">Save All</button'
  );
  $('.saveall-button').off().click(function(){
    updateAll();
  });

  $(".sfviewmenu").append(
    '<button type="button" class="btn btn-primary refresh-button">Refresh</button'
  );
  $('.refresh-button').off().click(function(){
    loadAllRecords();
  });

  $(".sfviewbody").empty();

  for (let i = 0; i < dm.b.length; i++) {
    $(".sfviewbody").append(
      '<div class="sfview-header sfview-base-box" id="sfview-hdr-b-' + i + '"></div>'
    );
    $("#sfview-hdr-b-" + i).append("<h4>" + dm.b[i].appname + "</h4>");
    for( var j = 0; j < dm.b[i].settings.layout.length; j++ ) {
      $("#sfview-hdr-b-" + i).append('<div>'+parseLayout( dm.b[i].settings.layout[j], getFieldsForLayout(i) )+'</div>');
    }
    $("#sfview-hdr-b-" + i).attr('style','cursor:pointer');
    $("#sfview-hdr-b-" + i).off().click(function() {
      jumpTo(i);
      renderFldEntry();
      renderSfView();
    });
    if( ri == i ) {
      $('#sfview-hdr-b-' + i).attr('style','border:2px solid red;');
    }
  }

  for (let i = 0; i < dm.r.length; i++) {
    $(".sfviewbody").append(
      '<div class="sfview-header" id="sfview-hdr-r-' + i + '"></div>'
    );
    $("#sfview-hdr-r-" + i).append("<h4>" + dm.r[i].appname + "</h4>");
  }

  for (let i = dm.b.length; i < r.length; i++) {
    $("#sfview-hdr-r-" + r[i].ri).append('<div class="sfview-record" id="sfview-rec-' + i + '"></div>');
    for ( let j = 0; j < dm.r[r[i].ri].settings.layout.length; j++ ) {
      $("#sfview-rec-" + i).append('<div>'+parseLayout( dm.r[r[i].ri].settings.layout[j], getFieldsForLayout(i) )+'</div>');
    }
    $('#sfview-rec-'+i).off().click(function(){
      jumpTo(i);
      renderFldEntry();
      renderSfView();
    });
    if( ri == i ) {
      $('#sfview-rec-' + i).attr('style','border: 2px solid red;');
    }
  }

  var currentScrollTop = $('.sfviewbody').scrollTop();

  if( ri < dm.b.length ) {
    var selElement = $('#sfview-hdr-b-' + ri);
  } else {
    var selElement = $('#sfview-rec-' + ri);
  }

  var offsettop = selElement.offset().top - $('.sfviewbody').offset().top;
  var offsetbottom = offsettop + selElement.height();

  if( offsetbottom > $('.sfviewbody').innerHeight() ) {
    $('.sfviewbody').scrollTop(currentScrollTop + offsetbottom - $('.sfviewbody').innerHeight() + 5);
  } else if ( offsettop < 0 ) {
    $('.sfviewbody').scrollTop(currentScrollTop + offsettop);
  }
  

};

var convertDate = function(strin) {

  var date = new Date(strin);

  var months = ['Jan.','Feb.','Mar.','Apr.','May','June','July','Aug.','Sep.','Oct.','Nov.','Dec.'];

  return months[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear();

}

var renderFldEntry = function() {

  /*if ( d.length == 0 ) {
    $(".fldwinleft").empty();
    $(".fldwinright").empty();
    $(".fldtitle").empty();
    $(".fldentry").empty();
    $(".fldinstr").empty();
    return;
  }*/

  if( ri >= r.length ) ri = r.length-1;
  if( ri < 0 ) ri = 0;

  $(".fldwinleft").empty();
  if (ri != 0 || fi != r[0].order[0]) {
    $(".fldwinleft").append('<a class="btn btn-primary" href="#" id="prevlink"><</a>');
    $("#prevlink").off().click(function() {
      updateR();
      setOrder();
      prevf();
      renderFldEntry();
      renderSfView();
    });
  }

  $(".fldwinright").empty();
  if (
    ri < r.length - 1 ||
    fi != r[r.length - 1].order[r[r.length - 1].order.length - 1]
  ) {
    $(".fldwinright").append('<a class="btn btn-primary" href="#" id="nextlink">></a>');
    $("#nextlink").off().click(function() {
      updateR();
      setOrder();
      nextf();
      renderFldEntry();
      renderSfView();
    });
  }

  var rec = r[ri];
  var rmap = getBorR();

  $(".fldtitle").empty();
  $(".fldtitle").append("<h4>" + rmap.fields[fi].appname + "</h4>");

  $(".fldinstr").empty();
  if (rmap.fields[fi].instructions) {
    $(".fldinstr").append("<p>" + rmap.fields[fi].instructions + "</p>");
  }

  $(".fldentry").empty();
  switch (rmap.fields[fi].type) {
    case "text":
      if (rmap.fields[fi].length > 260) {
        var fldinput = '<textarea style="resize: none" rows="5" cols="45" ';
      } else {
        var fldinput = '<input type="text" size="45" ';
      }
      fldinput +=
        'class="fldinput" maxlength = "' + rmap.fields[fi].length + '" > ';
      break;
    case "phone":
      var fldinput = '<input class="fldinput" type="text" size="45" maxlength="40">';
      break;
    case "url":
      var fldinput = '<input class="fldinput" type="text" size="50">';
      break;
    case "email":
      var fldinput =
        '<input class="fldinput" type="text" size="45" maxlength="' +
        rmap.fields[fi].length +
        '">';
      break;
    case "picklist":
      var fldinput = '<select class="fldinput">';
      fldinput += '<option value="">None</option>';
      for (var i = 0; i < rmap.fields[fi].values.length; i++) {
        fldinput += "<option>" + rmap.fields[fi].values[i] + "</option>";
      }
      fldinput += "</select>";
      break;
    case "date":
      var fldinput = '<input class="fldinput" type="text" maxlength="100">';
      break;
    case "index":
      var fldinput =
        '<input class="fldinput" type="text" size="45" maxlength="255">';
      break;
    case "boolean":
      var fldinput =
        '<input class="fldinput" type="checkbox" >';
        break;
    default:
      break;
  }
  $(".fldentry").append(fldinput);
  if (r[ri].f[fi].value) {
    if ( rmap.fields[fi].type == 'index' ) {
      if (r[ri].f[fi].showval ) {
        $('.fldinput').val(r[ri].f[fi].showval);
      }
    } else if ( rmap.fields[fi].type == 'date' ) {
      $('.fldinput').val(convertDate(r[ri].f[fi].value));
    } else if(rmap.fields[fi].type == 'boolean' ) {
      if ( r[ri].f[fi].value ) { $('.fldinput').prop('checked',true); } else { $('.fldinput').prop('checked',false); }
    } else {
      $(".fldinput").val(r[ri].f[fi].value);
    }
  }

  let rin = ri;
  let fin = fi;
  let so = rmap.fields[fin].indexto;

  $(".fldinput").off().change(function() {
    if (rmap.fields[fin].type == "index") {
      if ($('.fldinput').val() == '') {
        r[rin].f[fin].showval = null;
        r[rin].f[fin].value = null;
        updateR();
        setOrder();
        nextf();
        renderFldEntry();
        renderSfView();
        return;
      }
      r[rin].f[fin].showval = $('.fldinput').val();
      searchIndexRecord(rin, fin);
      return;
    }
    if(rmap.fields[fin].type == "boolean") {
      r[rin].f[fin].value = $(".fldinput").prop('checked');
      return
    }
    if (setValue(rin, fin, $(".fldinput").val())) {
      updateR();
      setOrder();
      nextf();
      renderFldEntry();
      renderSfView();
    }
  });
};

var renderIndexSearch = function(rin, fin, records) {
  var fm = getFm(rin, fin);

  $(".insrch-title").empty();
  $(".insrch-body").empty();

  $(".insrch-title").prepend('Searching for ' + fm.indexto );
  $('.insrch').modal('show');

  for (let i = 0; i < records.length; i++) {
    $(".insrch-body").append('<div class="insresult" id="insresult' + i + '"></div>');
    for ( let j = 0; j < fm.searchlayout.length; j++ ) {
      $("#insresult" + i).append('<span>'+parseLayout(fm.searchlayout[j], records[i])+'</span>');
    }
    $('#insresult' + i).off().click( function () {
      indexSearchSelected( rin, fin, records[i] );
      $('.insrch').modal('hide');
    });
  }
  $('.insrch-create-btn').off().click(function() {
    renderIndexCreate(rin, fin);
  });
};

var renderIndexCreate = function(rin, fin) {
  var map = getBorR(rin);
  var fm = getFm(rin, fin);

  $(".increate-title").empty();
  $('.increate-body').empty();


  $(".increate-title").append("Create new " + fm.appname + " record");

  var recordObj = {};
  recordObj.sobject = fm.indexto;
  recordObj.record = {};
  for ( let i = 0; i < fm.createfields.length; i++ ) {
    $('.increate-body').append('<div id="increate-fld-'+i+'"></div>');
    $('#increate-fld-'+i).append('<h5 id="increate-fldtitle-'+i+'"></h5>');
    $('#increate-fld-' + i).append('<input type="text" size="45" id="increate-fldinput-'+i+'">');
    $("#increate-fldtitle-"+i).append(fm.createfields[i] + ':' );
    if(fm.createfields[i] == fm.indexshow) {
      $("#increate-fldinput-"+i).val($('.fldinput').val());
    }
  }
  $('.increate-create-btn').off().click(function() {

    var apiObj = {
      sobject: fm.indexto,
      records: [{}]
    }
    
    for( var j = 0; j < fm.createfields.length; j++ ) {
      if($('#increate-fldinput-'+j).val()) {
        apiObj.records[0][fm.createfields[j]] = $('#increate-fldinput-'+j).val();
      }
    }

    for( var k in fm.indexfields ) {
      if( fm.indexfields[k].value ) {
        apiObj.records[0][k] = fm.indexfields[k].value;
      }
    }

    renderLoadingStart('Creating '+fm.appname+' record');
    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: "/api/create",
      dataType: "json",
      async: true,
      //json object to sent to the authentication url
      data: JSON.stringify(apiObj),
      success: function (data) {
        renderLoadingEnd();
        if( data[0].err || !data[0].success) {
          renderError('Could not create '+fm.indexto+': ' + data[0].err );
          return false;
        }

        $('.increate').modal('hide');
        setValue(rin, fin, data[0].id);
        r[rin].f[fin].showval = apiObj.records[0][fm.indexshow];
        renderFldEntry();
        renderSfView();
      }
    });

  });

  $('.increate').modal('show');

};

var renderAll = function() {
  renderSfView();
  renderFldEntry();
  renderDoc();
}
