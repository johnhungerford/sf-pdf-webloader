const d = require('./data.js');
const mf = require('./mapfunctions.js');
const sf = require('./searchfunctions.js');
const rf = require('./recarrayfunctions.js');
const uf = require('./upsertfunctions.js');
const ef = require('./eventfunctions.js');

const renderDoc = function(site) {
  $('.pdfwin').empty();
  if(site !== undefined) {
    $(".pdfwin").append('<iframe id="pdfiframe" height="100%" width="100%" src='+site+'></iframe>');
  } else {
    $(".pdfwin").append('<iframe id="pdfiframe" height="100%" width="100%" src="/doc.html"></iframe>');
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
        
        if(!rf.validateSelection(txt)) {
          renderSelectionErr(selec);
          selec.collapseToStart();
          $('.fldwin').attr("tabindex",-1).focus();
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
      $('#selecpopup').remove();
    });
  
  });
  
};

const renderSelectionErr = function(selec) {
  const fname = mf.getFm().appname;
  const $mainwin = $('.mainwin');
  const $iframe = $('.pdfwin');
  $mainwin.append('<div id="selecpopup" style="position:absolute;display:none;z-index:100;background-color:yellow;"><b>Invalid selection for field: "'+fname+'"</b></div>');
  const $popup = $('#selecpopup');
  $('#selecpopup').offset({ top: $iframe.position().top + mdownpos[1] - 45, left: $iframe.position().left + mdownpos[0] - 100}).show();
  setTimeout(()=>{
    $('#selecpopup').fadeOut('slow',()=>{
      $('#selecpopup').remove();
    });
  }, 2000);


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
  var map = mf.getBorR();

  var riloc = d.ri;
  var filoc = d.fi;

  $(".sfviewmenu").empty();

  if ( d.r[d.ri].type == 'search' ) {
    $(".sfviewmenu").append(
      '<button type="button" class="btn btn-primary newbase-button">New</button'
    );

    $(".newbase-button").off().click(function() {
      d.r[riloc].type = 'base';
      rf.setOrder(riloc);
      d.fi = d.r[riloc].order[0];
      renderFldEntry();
      renderSfView();
    });

    $(".sfviewbody").empty();
    $(".sfviewbody").append(
      "<h4>Find or Create " + map.appname + " (" + map.sobject + ")</h4>"
    );

    if (d.sdata.empty) {
      return false;
    }

    for (let i = 0; i < d.sdata.records.length; i++) {
      $(".sfviewbody").append(
        '<div class="search-result" data-id="' +
          d.sdata.records[i]["Id"] +
          '" id="sresult' +
          i +
          '"></div>'
      );
      for (var j in d.sdata.layout) {
        $("#sresult" + i).append(
          "<div>" + mf.parseLayout(d.sdata.layout[j], d.sdata.records[i]) + "</div>"
        );
      }
      $("#sresult" + i).off().click(function() {
        $.event.trigger({
          type: "searchSelect",
          Id: d.sdata.records[i]["Id"]
        });
      });
    }
  } else {
    $(".sfviewmenu").append(
      '<button type="button" class="btn btn-primary createbase-button">Add to Salesforce</button'
    );

    $(".createbase-button").off().click(function() {
      renderLoadingStart();
      uf.updateRecord(riloc, function(data, rin){
        renderLoadingEnd();
        if(data[0]) {
          if(data[0].id) {
            rf.setValue(rin, 'Id', data[0].id);
            d.r[rin].new = false;
            sf.loadAllRecords();
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

var renderSfView = function() {

  /*if (init) {
    $(".sfviewmenu").empty();
    $(".sfviewbody").empty();
    return;
  }*/

  if (d.search) {
    return renderBaseSearch();
  }

  if( d.ri >= d.r.length ) d.ri = d.r.length-1;
  if( d.ri < 0 ) d.ri = 0;

  $(".sfviewmenu").empty();

  $(".sfviewmenu").append(
    '<button type="button" class="btn btn-primary saveall-button" style="margin-right:5px;">Save All</button'
  );
  $('.saveall-button').off().click(function(){
    uf.updateAll();
  });

  $(".sfviewmenu").append(
    '<button type="button" class="btn btn-primary refresh-button">Refresh</button'
  );
  $('.refresh-button').off().click(function(){
    sf.loadAllRecords();
  });

  $(".sfviewbody").empty();

  for (let i = 0; i < d.dm.b.length; i++) {
    $(".sfviewbody").append(
      '<div class="sfview-header sfview-base-box" id="sfview-hdr-b-' + i + '"></div>'
    );
    $("#sfview-hdr-b-" + i).append("<h4>" + d.dm.b[i].appname + "</h4>");
    for( var j = 0; j < d.dm.b[i].settings.layout.length; j++ ) {
      $("#sfview-hdr-b-" + i).append('<div>'+mf.parseLayout( d.dm.b[i].settings.layout[j], mf.getFieldsForLayout(i) )+'</div>');
    }
    $("#sfview-hdr-b-" + i).attr('style','cursor:pointer');
    $("#sfview-hdr-b-" + i).off().click(function() {
      rf.jumpTo(i);
      renderFldEntry();
      renderSfView();
    });
    if( d.ri == i ) {
      $('#sfview-hdr-b-' + i).attr('style','border:2px solid red;');
    }
  }

  for (let i = 0; i < d.dm.r.length; i++) {
    $(".sfviewbody").append(
      '<div class="sfview-header" id="sfview-hdr-r-' + i + '"></div>'
    );
    $("#sfview-hdr-r-" + i).append("<h4>" + d.dm.r[i].appname + "</h4>");
  }

  for (let i = d.dm.b.length; i < d.r.length; i++) {
    $("#sfview-hdr-r-" + d.r[i].ri).append('<div class="sfview-record" id="sfview-rec-' + i + '"></div>');
    for ( let j = 0; j < d.dm.r[d.r[i].ri].settings.layout.length; j++ ) {
      $("#sfview-rec-" + i).append('<div>'+mf.parseLayout( d.dm.r[d.r[i].ri].settings.layout[j], mf.getFieldsForLayout(i) )+'</div>');
    }
    $('#sfview-rec-'+i).off().click(function(){
      rf.jumpTo(i);
      renderFldEntry();
      renderSfView();
    });
    if( d.ri == i ) {
      $('#sfview-rec-' + i).attr('style','border: 2px solid red;');
    }
  }

  var currentScrollTop = $('.sfviewbody').scrollTop();

  if( d.ri < d.dm.b.length ) {
    var selElement = $('#sfview-hdr-b-' + d.ri);
  } else {
    var selElement = $('#sfview-rec-' + d.ri);
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

  if( d.ri >= d.r.length ) d.ri = d.r.length-1;
  if( d.ri < 0 ) d.ri = 0;

  $(".fldwinleft").empty();
  if (d.ri != 0 || d.fi != d.r[0].order[0]) {
    $(".fldwinleft").append('<a class="btn btn-primary" href="#" id="prevlink"><</a>');
    $("#prevlink").off().click(function() {
      rf.updateR();
      rf.setOrder();
      rf.prevf();
      renderFldEntry();
      renderSfView();
    });
  }

  $(".fldwinright").empty();
  if (
    d.ri < d.r.length - 1 ||
    d.fi != d.r[d.r.length - 1].order[d.r[d.r.length - 1].order.length - 1]
  ) {
    $(".fldwinright").append('<a class="btn btn-primary" href="#" id="nextlink">></a>');
    $("#nextlink").off().click(function() {
      rf.updateR();
      rf.setOrder();
      rf.nextf();
      renderFldEntry();
      renderSfView();
    });
  }

  var rec = d.r[d.ri];
  var rmap = mf.getBorR();

  $(".fldtitle").empty();
  $(".fldtitle").append("<h4>" + rmap.fields[d.fi].appname + "</h4>");

  $(".fldinstr").empty();
  if (rmap.fields[d.fi].instructions) {
    $(".fldinstr").append("<p>" + rmap.fields[d.fi].instructions + "</p>");
  }

  $(".fldentry").empty();
  switch (rmap.fields[d.fi].type) {
    case "text":
      if (rmap.fields[d.fi].length > 260) {
        var fldinput = '<textarea style="resize: none" rows="5" cols="45" ';
      } else {
        var fldinput = '<input type="text" size="45" ';
      }
      fldinput +=
        'class="fldinput" maxlength = "' + rmap.fields[d.fi].length + '" > ';
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
        rmap.fields[d.fi].length +
        '">';
      break;
    case "picklist":
      var fldinput = '<select class="fldinput">';
      fldinput += '<option value="">None</option>';
      for (var i = 0; i < rmap.fields[d.fi].values.length; i++) {
        fldinput += "<option>" + rmap.fields[d.fi].values[i] + "</option>";
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
  if (d.r[d.ri].f[d.fi].value) {
    if ( rmap.fields[d.fi].type == 'index' ) {
      if (d.r[d.ri].f[d.fi].showval ) {
        $('.fldinput').val(d.r[d.ri].f[d.fi].showval);
      }
    } else if ( rmap.fields[d.fi].type == 'date' ) {
      $('.fldinput').val(convertDate(d.r[d.ri].f[d.fi].value));
    } else if(rmap.fields[d.fi].type == 'boolean' ) {
      if ( d.r[d.ri].f[d.fi].value ) { $('.fldinput').prop('checked',true); } else { $('.fldinput').prop('checked',false); }
    } else {
      $(".fldinput").val(d.r[d.ri].f[d.fi].value);
    }
  }

  let rin = d.ri;
  let fin = d.fi;
  let so = rmap.fields[fin].indexto;

  $(".fldinput").off().change(function() {
    if (rmap.fields[fin].type == "index") {
      if ($('.fldinput').val() == '') {
        d.r[rin].f[fin].showval = null;
        d.r[rin].f[fin].value = null;
        rf.updateR();
        rf.setOrder();
        rf.nextf();
        renderFldEntry();
        renderSfView();
        return;
      }
      d.r[rin].f[fin].showval = $('.fldinput').val();
      sf.searchIndexRecord(rin, fin);
      return;
    }
    if(rmap.fields[fin].type == "boolean") {
      d.r[rin].f[fin].value = $(".fldinput").prop('checked');
      return
    }
    if (rf.setValue(rin, fin, $(".fldinput").val())) {
      rf.updateR();
      rf.setOrder();
      rf.nextf();
      renderFldEntry();
      renderSfView();
    }
  });
};

var renderIndexSearch = function(rin, fin, records) {
  var fm = mf.getFm(rin, fin);

  $(".insrch-title").empty();
  $(".insrch-body").empty();

  $(".insrch-title").prepend('Searching for ' + fm.indexto );
  $('.insrch').modal('show');

  for (let i = 0; i < records.length; i++) {
    $(".insrch-body").append('<div class="insresult" id="insresult' + i + '"></div>');
    for ( let j = 0; j < fm.searchlayout.length; j++ ) {
      $("#insresult" + i).append('<span>'+mf.parseLayout(fm.searchlayout[j], records[i])+'</span>');
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
  var map = mf.getBorR(rin);
  var fm = mf.getFm(rin, fin);

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
        rf.setValue(rin, fin, data[0].id);
        d.r[rin].f[fin].showval = apiObj.records[0][fm.indexshow];
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

const renderInstructions = function () {
  $('.instructions-frame').show();
  ef.unbindEvents();
}

const renderInstructionsHide = function () {
  $('.instructions-frame').hide();
  ef.bindEvents();
}

module.exports.renderDoc =renderDoc;
module.exports.renderSelectionErr = renderSelectionErr;
module.exports.renderError = renderError;
module.exports.renderAlert = renderAlert;
module.exports.renderOpenUrl = renderOpenUrl;
module.exports.renderLoadingStart = renderLoadingStart;
module.exports.renderLoadingEnd = renderLoadingEnd;
module.exports.renderBaseSearch = renderBaseSearch;
module.exports.renderSfView = renderSfView;
module.exports.convertDate = convertDate;
module.exports.renderFldEntry = renderFldEntry;
module.exports.renderIndexSearch = renderIndexSearch;
module.exports.renderIndexCreate = renderIndexCreate;
module.exports.renderAll = renderAll;
module.exports.renderInstructions = renderInstructions;
module.exports.renderInstructionsHide = renderInstructionsHide;
