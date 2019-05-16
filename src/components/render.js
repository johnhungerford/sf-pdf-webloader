const React = require('react');

const d = require('./state');
const mf = require('../logic/mapfunctions');
const sf = require('../logic/searchfunctions');
const cf = require('../logic/configfunctions');
const PopupContent = require('../components/common/PopupContent').default;
const FormPopup = require('../components/common/FormPopup').default;
const LoadingPopup = require('../components/common/LoadingPopup').default;
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
    closeCallback: okCb,
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
  d.popups.push((
    <PopupContent keyprop={d.popups.length}>
      {popup}
    </PopupContent>
  ));
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
  console.log('renderAlert!');
  const popup = {
    header: 'Alert',
    body: msg,
    closeCallback: cancelCb,
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
  d.popups.push((
    <PopupContent keyprop={d.popups.length}>
      {popup}
    </PopupContent>
  ));
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

const renderLoadingStart = function(stateSetter, msg) {
  const hash = 'loadinghash' + Math.random().toString(36).substring(7);
  const popup =  <LoadingPopup keyprop={d.popups.length} hash={hash}>{msg}</LoadingPopup>;
  d.popups.push(popup);
  console.log(`popup ID: ${hash}`);

  setTimeout(() => {
    for (let i = d.popups.length - 1; i >= 0; i--) {
      if (d.popups[i].props.hash === hash) {
        d.popups.splice(i,1);
        stateSetter(d);
        return;
      }
    }
  }, 5000);

  stateSetter(d);
  return hash;
};

const renderLoadingEnd = function(stateSetter, popupId) {
  if (popupId === undefined ) {
    d.popups.pop();
    stateSetter(d);
    return
  }

  for (let i = d.popups.length - 1; i >= 0; i--) {
    if (d.popups[i].props && d.popups[i].props.hash === popupId) {
      d.popups.splice(i,1);
      stateSetter(d);
      return;
    }
  }
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

  d.popups.push((
    <PopupContent
      keyprop={d.popups.length}
    >
      {{
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
      }}
    </PopupContent>
  ));

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

  const popupChildren = {
    header: title,
    fields: fields,
    buttons: buttons,
    fm: indmap,
  };

  if(callback instanceof Function) popupChildren.callback = callback;
  d.popups.push(
    <IndexCreatePopup
      keyprop={d.popups.length}
    >
      {popupChildren}
    </IndexCreatePopup>
  );

  stateSetter(d);
};
 
renderAddConnection = function(stateSetter) {
  renderAlert(
    stateSetter,
    (<React.Fragment>
      <p>Setting up a connection to your Salesforce database will require creating a "Connected App," which can be accomplished by your organization's Salesforce administrator, or by following the directions <a href="" target="_blank">found here</a>. Its "Redirect Uri" should be set to https://sfwebloader.herokuapp.com/sfauth/token.</p>
      <p>Once the connected app is created, you can find the necessary information to create a connection in the settings. You will need the following information: <ol><li>Your organization's login url</li><li>The connected app's Client Id</li><li>Its Client Secret/Key</li></ol></p>
      <p>You will have the choice to login by using Salesforce's own Oauth authorization protocol, or by providing your own credentials (not recommended). If you choose Oauth, do not enter your credentials.</p>
    </React.Fragment>),
    ()=>{
      d.popups.push((
        <FormPopup>
          {{
            type: 'form',
            header: 'Create New Salesforce Connection',
            fields: [
              {
                type: 'text',
                label: 'Name this Connection',
                value: 'ex: MyOrg Connected App',
              },
              {
                type: 'select',
                label: 'Connection Method',
                options: [{showval: 'Oauth', value: 'oauth'}, {showval: 'Login', value: 'login'}],
              },
              {
                type: 'text',
                label: 'Login Url:',
                value: 'ex: naXX.salesforce.com/',
              },
              {
                type: 'text',
                label: 'Client ID',
              },
              {
                type: 'password',
                label: 'Client Secret/Key',
              },
              {
                type: 'text',
                label: 'Redirect Uri',
                value: 'https://sfwebloader.herokuapp.com/sfauth/token'
              },
              {
                type: 'text',
                label: 'Username',
              },
              {
                type: 'password',
                label: 'Password',
              },
            ],
            buttons: [
              {
                name: 'Cancel',
                clickHandler: ()=>{
                  d.popups.pop();
                  stateSetter(d);
                },
              },
              {
                name: 'Create Connection',
                type: 'submit',
              },
            ],
            submitHandler: (fields) => {
              const config = {
                type: fields[1].value,
                oauth: {
                  loginUrl: fields[2].value,
                  clientId: fields[3].value,
                  clientSecret: fields[4].value,
                  redirectUri: fields[5].value,
                },
                login: {
                  username: fields[6].value,
                  password: fields[7].value,
                },
              };
      
              renderLoadingStart(stateSetter, 'Submitting Configuration')
              cf.createConnection(stateSetter, config, fields[0].value, ()=>{
                renderLoadingEnd();
                d.popups.pop();
                stateSetter(d);
              });
            },
            closeCallback: ()=>{
              d.popups.pop();
              stateSetter(d);
            }
          }}
        </FormPopup>
      ));
    }
  );  
}

renderAddSchema = function(stateSetter) {

}

module.exports.renderAddConnection = renderAddConnection;
module.exports.renderAddSchema = renderAddSchema;
module.exports.renderAlert = renderAlert;
module.exports.renderIndexSearch = renderIndexSearch;
module.exports.renderError = renderError;
module.exports.renderErr = renderError;
module.exports.convertDate = convertDate;
module.exports.renderLoadingStart = renderLoadingStart;
module.exports.renderLoadingEnd = renderLoadingEnd;
module.exports.renderSelectionErr = renderSelectionErr;
