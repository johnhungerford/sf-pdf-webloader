import React, { Component } from 'react';

import * as d from '../state';
import * as mf from '../../logic/mapfunctions';
import * as rn from '../render';
import * as ajax from '../../logic/ajaxfunctions';
import * as rf from '../../logic/recarrayfunctions';
import * as sf from '../../logic/searchfunctions';

import Button from '../common/Button';

import * as styles from './Popup.module.css';

export default class FormPopup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fields: {}
        }

        for (let i in this.props.children.fields) {
            this.state.fields[i] = { 
                value: this.props.children.fields[i].init,
                id: null,
            };
        }
    }

    closePopup = () => {
        d.popups.pop();
        this.props.stateSetter(d);
    }

    componentDidUpdate = this.componentDidMount;

    componentDidMount = () => {
        
    }

    enterHandler = (e) => {
        if (e.key === undefined || e.key === 'Enter') {
            const ind = e.target.getAttribute('data-ind');
            if (
                e.target.value === '' ||
                this.props.children.fields[ind].type !== 'index' ||
                this.props.children.fields[ind].fm === undefined
            ) return;
            const indmap = this.props.children.fields[ind].fm;

            sf.searchIndexRecord(this.props.stateSetter, rin, fin, indmap, e.target.value, (data)=>{
                this.state.fields[ind].value = data[indmap.indexshow];
                this.state.fields[ind].id = data.id;
                if (this.props.children.fields[ind].callback instanceof Function) {
                    this.props.children.fields[ind].callback(data);
                }
            });
        }
    }

    createHandler = () => {
        console.log('CREATE HANDLER; props.children: ');
        console.log(this.props.children);
        if (this.props.children.fm === undefined) return;
        const indmap = this.props.children.fm;
        const recordObj = {};
        recordObj.sobject = indmap.indexto;
        recordObj.record = {};
        console.log('CREATING RECORD?');
        const apiObj = {
            sobject: indmap.indexto,
            records: [{}]
        }
        
        for(let j = 0; j < indmap.createfields.length; j++ ) {
            console.log(`${indmap.createfields[j]}:`);
            if(this.state.fields[j].value !== '') {
                if(this.state.fields[j].id) {
                    apiObj.records[0][indmap.createfields[j]] = this.state.fields[j].id;
                } else {
                    apiObj.records[0][indmap.createfields[j]] = this.state.fields[j].value;
                }
            }
        }
    
        for( var k in indmap.indexfields ) {
            if( indmap.indexfields[k].value ) {
            apiObj.records[0][k] = indmap.indexfields[k].value;
            }
        }
    
        console.log('API object for CREATE:');
        console.log(apiObj);
        rn.renderLoadingStart(this.props.stateSetter, 'Creating '+indmap.indexto+' record');
        ajax.postJSON(
            this.props.stateSetter,
            '/api/create',
            apiObj,
            (data) => {
                rn.renderLoadingEnd(this.props.stateSetter, 0);
                if( !data[0].success) {
                    rn.renderError('Could not create '+fm.indexto+': ' + data[0].err );
                    return false;
                }

                console.log(data[0]);
        
                if(this.props.children.callback instanceof Function) {
                    console.log('CALLING CALLBACK');
                    return this.props.children.callback(data);
                }
                
                d.r[d.ri].f[d.fi].value = data[0].id;
                rf.updateIndexFields(this.props.stateSetter, () => {
                    console.log('About to pop off the d\'s');
                    console.log(d.popups);
                    d.fldentry.value = d.r[d.ri].f[d.fi].showval;
                    d.fldentry.oldval = d.fldentry.value;
                    d.fldentry.submit = false;
                    d.fldentry.focus = null;
                    if (d.popups[d.popups.length - 1].type === 'loading') d.popups.pop();
                    d.popups.pop();
                    d.popups.pop();
                    this.props.stateSetter(d);
                }, d.ri);
            },
            (err) => renderError(err)
        );
    }

    render() {
        const { header, fields, buttons } = this.props.children;
        const zindStyle = {
            zIndex: this.props.zind,
        };

        const zindBg = {
            zIndex: this.props.zind - 1,
        };

        console.log(this.props.children);
        const form = fields.map((val, ind) => {
            return (
                <div key={`create-fields-${d.popups.length}-${ind}`}>
                    <h5 key={`header-${d.popups.length}-${ind}`}>{val.label}</h5>
                    <input 
                        type={val.type}
                        value={this.state.fields[ind].value}
                        data-id={this.state.fields[ind].id}
                        data-ind={ind}
                        key={`create-fields-input-${d.popups.length}-${ind}`}
                        onKeyPress={this.enterHandler}
                        onBlur={this.enterHandler}
                        onChange={(e)=>{
                            const value = e.target.value;
                            const id = e.target.getAttribute('data-id');
                            const ind = e.target.getAttribute('data-ind');
                            this.setState((oldState) => {
                                const newState = {
                                    fields: {
                                        ...oldState.fields
                                    }
                                }

                                newState.fields[ind].value = value;
                                newState.fields[ind].id = id
                                return newState;
                            });
                        }} 
                    />
                </div>
            );
        });

        return (
            <div
                style={zindBg}
                className={`${styles.window} ${this.props.top ? styles.dark : styles.transp}`}
                key={this.props.keyprop}
            >

                <div 
                    style={zindStyle}
                    className={`${styles.popup}`}
                >
                    <div 
                        className={styles.closeBox}
                        onClick={this.closePopup}
                    >×</div>
                    <div className={styles.header}>
                        <h3>{header}</h3>
                    </div>
                    <div className={styles.body}>
                        {form}
                    </div>
                    <div className={styles.buttonDiv}>
                        
                        {buttons.map((button) => { 
                            const createButton = (
                                <Button
                                    class={styles.button}
                                    clickHandler={this.createHandler}
                                >
                                    {button.name}
                                </Button>
                            );

                            const normalButton = (
                                <Button 
                                    clickHandler={button.clickHandler}
                                    class={styles.button}
                                >
                                    {button.name}
                                </Button>
                            );

                            return button.name === 'Create' ? createButton : normalButton;
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
