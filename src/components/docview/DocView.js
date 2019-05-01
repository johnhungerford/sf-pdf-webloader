import React, { Component } from 'react';

import Panel from '../common/Panel.js';

import styles from './DocView.module.css';

export default class DocView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.load) return (
            <Panel 
                outerClass={`${styles.outer} ${this.props.class}`}
            >
                <iframe 
                    className={styles.dociframe}
                    src={this.props.sample ? "doc/sample.pdf" : "/doc/view" }
                />
            </Panel>
        );

        return (
            <Panel 
                outerClass={`${styles.outer} ${this.props.class}`}
                innerClass={styles.centered}
            >
                Click "Upload PDF" or "Load Sample PDF" to view a document for data entry.
            </Panel>
        );
    }
}

/*
const validateSelection = function(str) {
  str = str.trim();
  const $fldinput = $('.fldinput');
  const type = mf.getFm().type;
  let outval = true;

  // If fldinput is an <input> tag
  if($fldinput.prop('nodeName') === 'INPUT') {
    // If fldinput is of type "text"
    if($fldinput.attr('type') === 'text') {
      // Reject if there are any line breaks
      if(str.indexOf('\n') > -1) outval = false;
      // Reject if it is longer than the 'size' attribute of the input
      if(str.length > $fldinput.attr('size')) outval = false;
    } 

  // If fldinput is a <select> tag
  } else if($fldinput.prop('nodeName') === 'SELECT') {
    outval = false;
    $('.fldinput option').each(function(){
      if (this.value == str) {
        outval = true;
      }
    });
  } 

  if(type === 'phone') {
    if(str.length > 20) outval = false;
    if(/[\&\@\$\%\^\{\}]/.test(str)) outval = false;
    if(!/\d/.test(str)) outval = false;
  } else if(type === 'date') {
    if(str.length > 19) outval = false;
  } else if(type === 'email') {
    const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if (!re.test(str)) outval = false;
  } else if(type === 'url') {
    const re = /[\s\"]+/
    const re2 = /\.+/
    if (re.test(str)) outval = false;
    if (!re2.test(str)) outval = false;
  }

  return outval;
}
*/