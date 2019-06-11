import React, { Component } from 'react';

import * as rf from '../../logic/recarrayfunctions';
import * as mf from '../../logic/mapfunctions';
import * as rn from '../render';
import * as d from '../state';

import styles from './SfRecordEntry.module.css';
import { runInNewContext } from 'vm';

class SfRecordEntry extends Component {
    constructor(props) {
        super(props);
    }

    deleteRecord = (e) => {
        e.stopPropagation();
        if (d.r[this.props.ri].new) {
            if (d.ri >= this.props.ri) {
                d.ri -= 1;
                d.fi = d.r[d.ri].order[0];
            }
            d.r.splice(this.props.ri,1);
            this.props.stateSetter(d);
            return;
        }

        rn.renderAlert(
            this.props.stateSetter,
            'A version of this record exists in Salesforce. If you continue, it will be deleted in your current session but will remain in Salesforce until you click "Save All." To undo this deletion at any point before then, click "Refresh."',
            () => {
                d.r[this.props.ri].delete = true;
                this.props.stateSetter(d);
            }
        );
    }

    render() {
        let entryStyle;
        if (this.props.type === 'base') {
            entryStyle = this.props.bi === d.ri ? styles.active : styles.inactive;
        }

        if (this.props.type === 'record') {
            entryStyle = this.props.ri === d.ri ? styles.active : styles.inactive;
        }

        if (this.props.type === 'base') return (
            <div 
                ref={this.props.refprop}
                key={`sfbaserecordentry-${this.props.keyprop}`}
                className={`${styles.base} ${styles.entry}`}
                onClick={()=>{
                    rf.jumpTo(this.props.bi);
                    this.props.stateSetter(d);
                }}
            > 
                <div>
                    <h3>{d.dm.b[this.props.bi].appname}</h3>
                    <div className={`${styles.record} ${entryStyle}`}>
                        {d.dm.b[this.props.bi].settings.layout.map((val,ind)=>(
                            <p 
                                key={`baselayout-${this.props.bi}-${ind}`}
                                className={styles.recordp}
                                dangerouslySetInnerHTML={{
                                    __html: mf.parseLayout( 
                                            val,
                                            mf.getFieldsForLayout(this.props.bi)
                                        )
                                }}
                            />
                                
                        ))}
                    </div>
                </div>
            </div>
        );

        if (this.props.type === 'heading') {
            return (
                <div 
                    key={`sfrecordheader-${this.props.keyprop}`}
                    className={`${styles.header}`}
                > 
                    <h3>{d.dm.r[this.props.ri].appname}</h3>
                </div>
            );
        }

        if (this.props.type === 'record') {
            return (
                <div 
                    ref={this.props.refprop}
                    key={`sfrecordentry-${this.props.keyprop}`}
                    className={`${styles.entry}`}
                    onClick={()=>{
                        rf.jumpTo(this.props.ri);
                        this.props.stateSetter(d);
                    }}
                > 
                    <div className={`${styles.record} ${entryStyle}`}>
                        {d.dm.r[d.r[this.props.ri].ri].settings.layout.map((value, index) => (
                            <p 
                                key={`recordlayout-${this.props.ri}-${index}`}
                                className={styles.recordp}
                                dangerouslySetInnerHTML={{
                                    __html: mf.parseLayout(
                                            value,
                                            mf.getFieldsForLayout(this.props.ri)
                                        )
                                }}
                            />
                        ))}
                    </div>
                    <div className={styles.closeBox}>
                        <div className={styles.closeBoxBox}>
                            <div 
                                className={styles.closex}
                                onClick={this.deleteRecord}
                            >{'×'}</div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default React.forwardRef((props, ref) => <SfRecordEntry refprop={ref} {...props} />);
