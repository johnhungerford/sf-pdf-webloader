import React, { Component } from 'react';

import * as d from '../state';
import * as rf from '../../logic/recarrayfunctions';

import styles from './DocView.module.css';

export default class DocView extends Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
      if (this.ifr === undefined || this.ifr === null) return;

      console.log(this.ifr);

      this.ifr.onload = () => {
        this.ifr.contentDocument.body.onmouseup = (e) => {
          console.log('up');
          const selec = this.ifr.contentDocument.getSelection();
          const txt = selec.toString();
          if(!txt) { return; }
          console.log('selection: '+ txt);
          if(d.mdownpos === []) d.mdownpos = [e.pageX, e.pageY];
          /*if(!rf.validateSelection(txt)) {
            d.doc.selectionerr = selec;
            selec.collapseToStart();
            d.fldentry.focus = 'true';
            return;
          }*/

          d.fldentry.value = txt;
          selec.collapseToStart();
          d.fldentry.focus = 'off';
          rf.submit(this.props.stateSetter);
          console.log(d.fldentry.value);
          d.mdownpos = [];
        };
      
        this.ifr.contentDocument.body.onmousedown = (e) => {
          console.log('down');
          d.mdownpos = [e.pageX, e.pageY];
          d.doc.selectionerr = null;
        };
      }
    }

    render() {
        return (
            <div className={`${styles.frame} ${this.props.class}`}>
              { d.doc.render ? 
                d.doc.sample ? 
                  (<iframe 
                    className={styles.dociframe} 
                    src='/sample.html' 
                    ref={(f) => this.ifr = f}
                  />) : 
                  (<iframe 
                    className={styles.dociframe} 
                    srcDoc={d.doc.html}
                    ref={(f) => this.ifr = f}
                  />) :
                  (
                    <div className={styles.centered}>
                      Click "Upload PDF" or "Load Sample PDF" to view a document for data entry.
                    </div>
                  )
              }
            </div>
        );
    }
}
