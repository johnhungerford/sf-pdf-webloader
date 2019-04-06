const d = require('./data.js');
const df = require('./docfunctions.js');
const rf = require('./recarrayfunctions.js');
const rn = require('./render.js');

/** 
 * Bind functions to document buttons (cached above) and keypresses. The buttons that add documents
 * are file type input elements, and the 'change' event means a file has been added.
 * The button to remove a document is just a button, so the function is bound to a click event.
 */
const bindEvents = function() {
    d.$initentry.off().click(function() {
      if( !rf.allUnchanged() ) {
        rn.renderAlert('Initiating data entry will end your current session, erasing any unsaved data. Are you sure you wish to continue?', 
          () => {
          rf.initR();
          rn.renderSfView();
          rn.renderFldEntry();
        });
      } else {    
        rf.initR();
        rn.renderSfView();
        rn.renderFldEntry();
      }
    });
  
    d.$addoc.off().change(function(){
      const fd = new FormData();
      fd.append('file', d.$addoc[0].files[0]);
      d.$addoc.val(null);
      return df.addDoc(fd);
    });
  
    d.$loadsample.off().click(function() {
      rn.renderDoc('/pdfviewer/web/viewer.html?file=/doc/SampleRoster.pdf');
      if(r=[]) {
        rf.initR();
        rn.renderSfView();
        rn.renderFldEntry();
      }
    });
  
    d.$removedoc.off().click(function(){
      /** 
       * If any records have been edited, warn before proceeding (callback is executed by alert 
       * function upon confirmation)
       */
      if( !rf.allUnchanged() ) {
        rn.renderAlert('Removing document now will erase all unsaved changes.', () => {
          df.removeDoc(function() {
            rf.initR();
            rn.renderAll();
          });
        });
      } else {    
        df.removeDoc(function() {
          rf.initR();
          rn.renderAll()
        });
      }
  
    });
  
    d.$instr.off().click(function() {
      rn.renderInstructions();
    });
  
    // Handle keydown events to cycle through fields and records
    $(document).off('keydown').keydown((e) => {
      let $fldinput = $('.fldinput');
  
      // If the focus is on any text input or textarea, disregard any other keystrokes, but 
      // make the "enter" key enter the data
      if( $('select').is(':focus') || $('input').is(':focus') || $('textarea').is(':focus') ) {
        // Enter triggers 'change' event on fldinput element. See renderFldEntry() for handler
        if(e.which === 13) {
          if($fldinput) $fldinput.change();
        } 
        return;
      }
  
      if(e.which === 39) { // 39: right
        if( !rf.nextf() ) { return; }
      } else if(e.which === 37) { // 37: left
        if( !rf.prevf() ) { return; }
      } else if(e.which === 40) { // 40: down
        if( !rf.nextr() ) { return; }
      } else if(e.which === 38) { // 38: up
        if( !rf.prevr() ) { return; }
      } else if(e.which === 32) { // 32: space
        // see below (skip the return)
      } else {
        return;
      }
  
      rn.renderFldEntry();
      rn.renderSfView();
  
      // Space focuses on fldinput, but only *after* fldinput is rendered
      if(e.which === 32) {
        e.preventDefault();
        let $fldinput = $('.fldinput');
        if ($fldinput) $fldinput.focus();
      }
      
    });
  }

const unbindEvents = function() {
    d.$initentry.off();
    d.$addoc.off();
    d.$loadsample.off();
    d.$removedoc.off();
    d.$instr.off();
    $(document).off('keydown');
  }

module.exports.bindEvents = bindEvents;
module.exports.unbindEvents = unbindEvents;
