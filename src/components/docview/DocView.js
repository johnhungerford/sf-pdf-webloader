import React, { Component } from 'react';

import * as d from '../state';
import * as rf from '../../logic/recarrayfunctions';
import * as rn from '../render';

import styles from './DocView.module.css';

export default class DocView extends Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
      if (this.ifr === undefined || this.ifr === null) return;


      this.ifr.onload = () => {
        this.ifr.contentDocument.body.onmouseup = (e) => {
          const selec = this.ifr.contentDocument.getSelection();
          const txt = selec.toString();
          if(!txt) { return; }
          if(d.mdownpos === []) d.mdownpos = [e.pageX, e.pageY];
          if(!rf.validateSelection(txt)) {
            rn.renderSelectionErr(this.ifr);
            selec.collapseToStart();
            this.props.stateSetter(d, ()=>{
              document.getElementById('app').focus();
            });
            return;
          }
          
          d.fldentry.value = txt;
          d.fldentry.submit = true;
          d.fldentry.next = true;
          d.mdownpos = [];
          selec.collapseToStart();
          this.props.stateSetter(d, ()=>{
            document.getElementById('app').focus();
          });
        };
      
        this.ifr.contentDocument.body.onmousedown = (e) => {
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
