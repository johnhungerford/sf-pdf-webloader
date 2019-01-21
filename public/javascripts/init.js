// Cache jQuery lookups for buttons to add and remove pdfs
const $addoctop = $('#adddoctop');
const $addocnext = $('#adddocnext');
const $addocbottom = $('#adddocbottom');
const $removedoc = $('#removedoc');

/** 
 * Bind functions to document buttons (cached above). The buttons that add documents
 * are file type input elements, and the 'change' event means a file has been added.
 * The button to remove a document is just a button, so the function is bound to a click event.
 */
$addoctop.change(function(){
  const fd = new FormData();
  fd.append('file', $addoctop[0].files[0]);
  $addoctop.val(null);
  return addDoc('top', fd);
});

$addocnext.change(function(){
  const fd = new FormData();
  fd.append('file', $addocnext[0].files[0]);
  $addocnext.val(null);
  return addDoc('next', fd);
});

$addocbottom.change(function(){
  const fd = new FormData();
  fd.append('file', $addocbottom[0].files[0]);
  $addocbottom.val(null);
  return addDoc('bottom', fd);
});

$removedoc.click(function(){
  if( r.length == 0 ) { return; }

  /** 
   * If any records have been edited, warn before proceeding (callback is executed by alert 
   * function upon confirmation)
   */
  if( !allUnchanged() ) {
    renderAlert('Removing document now will erase all unsaved changes.', () => {
      removeDoc(d[di], function() {initR();});
    });
  } else {    
    removeDoc(d[di], function() {initR();});
  }

});

// Handle keydown events to cycle through fields and records
$(document).keydown((e) => {
  let $fldinput = $('.fldinput');

  // Enter triggers 'change' event on fldinput element. See renderFldEntry() for handler
  if(e.which === 13) {
    if($fldinput) $fldinput.change();
  } 

  // Disregard all other key values if the focus is on any text input or textarea
  if( $('input').is(':focus') || $('textarea').is(':focus') ) {
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
    let $fldinput = $('.fldinput');
    if ($fldinput) $fldinput.focus();
  }
  
});

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
  // setting the parameter to 'true' ensures that r will be initalized after the docs are pulled
  getDocs(updateDocCallback(true));
});
