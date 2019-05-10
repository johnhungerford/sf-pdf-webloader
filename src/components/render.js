const React = require('react');

const d = require('./state');
const mf = require('../logic/mapfunctions');
const sf = require('../logic/searchfunctions');
const ajax = require('../logic/ajaxfunctions');

const renderSelectionErr = function(ifr) {
  // const fname = mf.getFm().appname;
  const fname = 'Test';
  const tmpDiv = document.createElement('div');
  const ifrRect = ifr.getBoundingClientRect();
  const style = 'position: absolute; z-index: 100; background-color: yellow; ';
  const pos = `top: ${ifrRect.top + d.mdownpos[1] - 45}; left: ${ifrRect.left + d.mdownpos[0] - 100};`;
  const htmlString = `<div id="selecpopup" style="${style} ${pos}"><b>Invalid selection for field: "${fname}"</b></div>`;
  tmpDiv.innerHTML = htmlString;
  const popup = tmpDiv.firstChild;
  document.body.appendChild(popup);
  let op = 1;  // initial opacity
  const time = 600;
  const interval = op / (time / 50);
  setTimeout(()=>{
    let timer = setInterval(function () {
      if (op <= 0){
          clearInterval(timer);
          popup.style.display = 'none';
      }

      popup.style.opacity = op;
      popup.style.filter = `alpha(opacity=${op * 100})`;
      op -= interval;
    }, 50);
  }, 2000);
}

var renderError = function(stateSetter, msg, callback) {
  const popup = {
    header: 'Error!',
    body: msg,
  }

  const buttons = [];
  if (callback instanceof Function) {
    buttons.push({
      name: 'Try Again',
      clickHandler: tryAgainCb,
    });
  }

  buttons.push({
    name: 'OK',
    clickHandler: okCb,
  })

  popup.buttons = buttons;
  d.popups.push(popup);
  stateSetter(d);

  function tryAgainCb() {
    d.popups.pop();
    stateSetter(d);
    if (callback instanceof Function) callback();
  };

  function okCb() {
    d.popups.pop();
    stateSetter(d);
  };
};


const renderAlert = function(stateSetter, msg, callback) {
  const popup = {
    header: 'Alert',
    body: msg,
  }

  let buttons = [];
  if (callback instanceof Function) {
    buttons = [
      {
        name: 'Continue',
        clickHandler: continueCb,
      },
      {
        name: 'Cancel',
        clickHandler: cancelCb,
      }
    ];
  } else {
    buttons = [
      {
        name: 'OK',
        clickHandler: cancelCb,
      }
    ];
  }

  popup.buttons = buttons;
  d.popups.push(popup);
  stateSetter(d);

  function continueCb() {
    d.popups.pop();
    stateSetter(d);
    if (callback instanceof Function) {
      console.log('RUN CONTINUE CALLBACK...');
      callback();
    }
  };

  function cancelCb() {
    d.popups.pop();
    stateSetter(d);
  };
};

var renderLoadingStart = function(stateSetter, msg) {
  d.popups.push({
    type: 'loading',
    body: msg,
  });

  stateSetter(d);
};

var renderLoadingEnd = function(stateSetter, time) {
  if (time === 0) {
    for(let i = d.popups.length - 1; i >= 0; i--) {
      if (d.popups[i].type === 'loading') return d.popups.splice(i,1);
    }

    return;
  }

  setTimeout(() => {
    for(let i = d.popups.length - 1; i >= 0; i--) {
      if (d.popups[i].type === 'loading') d.popups.splice(i,1);
    }

    stateSetter(d);
  }, time === undefined ? 200 : time);
};

var convertDate = function(strin) {

  var date = new Date(strin);

  var months = ['Jan.','Feb.','Mar.','Apr.','May','June','July','Aug.','Sep.','Oct.','Nov.','Dec.'];

  return months[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear();

}

const renderIndexSearch = function(stateSetter, rin, fin, records, indmap, callback, valin) {
  var fm = mf.getFm(rin, fin);
  var value = d.fldentry.value;

  if (indmap instanceof Object && callback instanceof Function) {
    fm = indmap;
    value = valin === undefined ? '' : valin;
  }

  var title = 'Searching for ' + fm.indexto;

  const body = [];
  for (let i = 0; i < records.length; i++) {
    const content = [];
    for ( let j = 0; j < fm.searchlayout.length; j++ ) {
      content.push((
        <span key={`search-span-${i}-${j}`}>{mf.parseLayout(fm.searchlayout[j], records[i])}</span>
      ));
    }

    body.push((
      <div 
        key={`search-div-${i}`}
        style={{marginBottom: 8, cursor: 'pointer'}}
        onClick={()=>{
          if (indmap instanceof Object && callback instanceof Function) {
            return callback(records[i]);
          } 

          sf.indexSearchSelected(stateSetter, rin, fin, records[i]);
          d.popups.pop();
          stateSetter(d);
        }}
      >
        {content}
      </div>
    ));
  }

  d.popups.push({
    type: 'normal',
    header: title,
    body: body,
    buttons: [
      {
        name: 'Create New',
        clickHandler: () => {
          if (indmap instanceof Object && callback instanceof Function) {
            return renderIndexCreate(stateSetter, fm, value, callback);
          }

          renderIndexCreate(stateSetter, fm, value);
        },
      },
      {
        name: 'Cancel',
        clickHandler: () => {
          d.popups.pop();
          stateSetter(d);
        },
      },
    ],
  })
  
  stateSetter(d);
};

var renderIndexCreate = function(stateSetter, indmap, value, callback) {
  const title = "Create new " + indmap.appname + " record";
  const fields = [];
  const buttons = [
    {
      name: 'Create',
    },
    {
      name: 'Cancel',
      clickHandler: ()=>{
        d.popups.pop()
        stateSetter(d);
      },
    }
  ];

  for ( let i = 0; i < indmap.createfields.length; i++ ) {
    fields.push({});
    if (indmap.indexfields[indmap.createfields[i]].type !== 'index') {
      fields[i].label = indmap.createfields[i] + ':';
      fields[i].type = 'text';
      fields[i].init = indmap.createfields[i] === indmap.indexshow ? value : '';
      continue;
    }
    
    fields[i].label = indmap.createfields[i] + ':';
    fields[i].type = 'index';
    fields[i].init = indmap.createfields[i] === indmap.indexshow ? value : '';
  }

  const popup = {
    type: 'form',
    header: title,
    fields: fields,
    buttons: buttons,
    fm: indmap,
  };

  if(callback instanceof Function) popup.callback = callback;
  d.popups.push(popup);
  stateSetter(d);
};
 
/*

const renderInstructions = function () {
  $('.instructions-frame').show();
  ef.unbindEvents();
}

const renderInstructionsHide = function () {
  $('.instructions-frame').hide();
  ef.bindEvents();
}

module.exports.renderDoc =renderDoc;
module.exports.renderOpenUrl = renderOpenUrl;
module.exports.renderBaseSearch = renderBaseSearch;
module.exports.renderSfView = renderSfView;
module.exports.renderFldEntry = renderFldEntry;
module.exports.renderIndexCreate = renderIndexCreate;
module.exports.renderAll = renderAll;
module.exports.renderInstructions = renderInstructions;
module.exports.renderInstructionsHide = renderInstructionsHide;*/

module.exports.renderAlert = renderAlert;
module.exports.renderIndexSearch = renderIndexSearch;
module.exports.renderError = renderError;
module.exports.renderErr = renderError;
module.exports.convertDate = convertDate;
module.exports.renderLoadingStart = renderLoadingStart;
module.exports.renderLoadingEnd = renderLoadingEnd;
module.exports.renderSelectionErr = renderSelectionErr;
