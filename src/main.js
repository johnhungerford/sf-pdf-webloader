const d = require('./data.js');
const rn = require('./render.js');
const ef = require('./eventfunctions.js');

// Cache jQuery lookups for buttons to add and remove pdfs
d.$addoc = $('#adddoc');
d.$loadsample = $('#loadsample')
d.$removedoc = $('#removedoc');
d.$initentry = $('#initentry');
d.$instr = $('#instr-button');

/**
 * This ajax call gets everything started: it pulls the document map (a json config file) from
 * the server, sets it up as a global variable, and calls getDocs() to grab the list of pdfs
 * stored on the server. 
 */
$.getJSON("/api/dm", function(data) {
  if (!data.b || !data.r) {
    rn.renderError('Can\'t access server!');
    return;
  }

  d.dm = data;
  ef.bindEvents();
  $('.instructions-frame').click(rn.renderInstructionsHide);
  $('.close-button').click(rn.renderInstructionsHide);

  $('.instructions').off().click((e)=>{e.stopPropagation()});
  $('.modal').on('hidden.bs.modal', function () {
    ef.bindEvents();
  });
  $('.modal').on('shown.bs.modal', function () {
    // Make sure focus is not on fldentry, where damage can be done...
    $('.fldwin').attr("tabindex",-1).focus();
    ef.unbindEvents();
  });
  // setting the parameter to 'true' ensures that r will be initalized after the docs are pulled

});
