// Cache jQuery lookups for buttons to add and remove pdfs
const $addoc = $('#adddoc');
const $loadsample = $('#loadsample')
const $removedoc = $('#removedoc');
const $initentry = $('#initentry');
const $instr = $('#instr-button');

/** 
 * Bind functions to document buttons (cached above) and keypresses. The buttons that add documents
 * are file type input elements, and the 'change' event means a file has been added.
 * The button to remove a document is just a button, so the function is bound to a click event.
 */
const bindEvents = function() {
  $initentry.off().click(function() {
    if( !allUnchanged() ) {
      renderAlert('Initiating data entry will end your current session, erasing any unsaved data. Are you sure you wish to continue?', 
        () => {
        initR();
        renderSfView();
        renderFldEntry();
      });
    } else {    
      initR();
      renderSfView();
      renderFldEntry();
    }
  });

  $addoc.off().change(function(){
    const fd = new FormData();
    fd.append('file', $addoc[0].files[0]);
    $addoc.val(null);
    return addDoc(fd);
  });

  $loadsample.off().click(function() {
    renderDoc('/pdfviewer/web/viewer.html?file=/doc/SampleRoster.pdf');
    if(r=[]) {
      initR();
      renderSfView();
      renderFldEntry();
    }
  });

  $removedoc.off().click(function(){
    /** 
     * If any records have been edited, warn before proceeding (callback is executed by alert 
     * function upon confirmation)
     */
    if( !allUnchanged() ) {
      renderAlert('Removing document now will erase all unsaved changes.', () => {
        removeDoc(function() {
          initR();
          renderAll();
        });
      });
    } else {    
      removeDoc(function() {
        initR();
        renderAll()
      });
    }

  });

  $instr.off().click(function() {
    renderInstructions();
  });

  // Handle keydown events to cycle through fields and records
  $(document).off('keydown').keydown((e) => {
    let $fldinput = $('.fldinput');

    // Enter triggers 'change' event on fldinput element. See renderFldEntry() for handler
    if(e.which === 13) {
      if($fldinput) $fldinput.change();
    } 

    // Disregard all other key values if the focus is on any text input or textarea
    if( $('select').is(':focus') || $('input').is(':focus') || $('textarea').is(':focus') ) {
      return;
    }

    if(e.which === 39) { // 39: right
      if( !nextf() ) { return; }
    } else if(e.which === 37) { // 37: left
      if( !prevf() ) { return; }
    } else if(e.which === 40) { // 40: down
      if( !nextr() ) { return; }
    } else if(e.which === 38) { // 38: right
      if( !prevr() ) { return; }
    } else if(e.which === 32) { // 32: space
      // see below (skip the return)
    } else {
      return;
    }

    renderFldEntry();
    renderSfView();

    // Space focuses on fldinput, but only *after* fldinput is rendered
    if(e.which === 32) {
      e.preventDefault();
      let $fldinput = $('.fldinput');
      if ($fldinput) $fldinput.focus();
    }
    
  });
}

const unbindEvents = function() {
  $initentry.off();
  $addoc.off();
  $loadsample.off();
  $removedoc.off();
  $instr.off();
  $(document).off('keydown');
}

/**
 * This ajax call gets everything started: it pulls the document map (a json config file) from
 * the server, sets it up as a global variable, and calls getDocs() to grab the list of pdfs
 * stored on the server. 
 */
$.getJSON("/api/dm", function(data) {
  if (!data.b || !data.r) {
    renderError('Can\'t access server!');
    return;
  }

  dm = data;
  bindEvents();

  $('.instructions').off().click((e)=>{e.stopPropagation()});
  $('.modal').on('hidden.bs.modal', function () {
    bindEvents();
  });
  $('.modal').on('shown.bs.modal', function () {
    // Make sure focus is not on fldentry, where damage can be done...
    $('.fldwin').attr("tabindex",-1).focus();
    unbindEvents();
  });
  // setting the parameter to 'true' ensures that r will be initalized after the docs are pulled

});
