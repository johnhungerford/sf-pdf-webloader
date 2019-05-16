import React, { Component } from 'react';

import * as d from '../state';
import * as rn from '../render';

import PopupContent from '../common/PopupContent';
import Button from '../common/Button';

import * as styles from './SchemaConfigure.module.css';
import { runInNewContext } from 'vm';

export default class ObjectSelector extends Component {
    constructor(props) {
        super(props);

        if (this.props.sObjects.length === 0) {
            this.props.getObjects((err) => {rn.renderErr(this.props.stateSetter, err.message)});
        }

        this.state = {
            filterText: '',
            submittable: this.validate(),
        }
    }

    validate = () => {
        const r = this.props.r;
        const b = this.props.b;

        if (r.length === 0 && b.length === 0) return false;
        for (let i in b) {
            if (b[i].settings === undefined) return false;
            if (!(b[i].settings.layout instanceof Array)) return false;
            if (b[i].settings.layout.length === 0) return false;
            if (!(b[i].settings.order instanceof Array)) return false;
            if (b[i].settings.order.length === 0) return false;
            if (b[i].fields.Id === undefined) return false;
            let ctr = 0;
            for (let i in b[i].fields) ctr++;
            if (ctr < 2) return false;
        }

        for (let i in r) {
            if (r[i].settings === undefined) return false;
            if (!(r[i].settings.layout instanceof Array)) return false;
            if (r[i].settings.layout.length === 0) return false;
            if (!(r[i].settings.order instanceof Array)) return false;
            if (r[i].settings.order.length === 0) return false;
            if (r[i].fields.Id === undefined) return false;
            let ctr = 0;
            for (let i in r[i].fields) ctr++;
            if (ctr < 2) return false;
        }

        return true;
    };

    formObj = (sfname) => {
        let obj;
        for (let i in this.props.sObjects) if (this.props.sObjects[i].name === sfname) obj = this.props.sObjects[i];
        
        return {
            appname: obj.label,
            sobject: sfname,
            settings: {
                searchlayout: [],
                searchorder: [],
                layout: [],
                order: [],
            },
            fields: {
                Id: {
                    sfname: "Id",
                    sfid: true,
                    type: 'id',
                }
            },
        }
    }

    render = () => {
        console.log('Submittable??');
        console.log(this.state.submittable);
        const header = `Select Salesforce Objects`;
        const body = (
            <div>
                <div className={styles.addedObjects}>
                    <h4>Base Records</h4>
                    <table><tbody>
                        {this.props.b.map((val,ind) => {
                            return (
                                <tr>
                                    <td><Button keyprop={`sobj-addbase-b-btn-${ind}`}
                                        option='small'
                                        clickHandler={this.props.delObj('base', ind)}
                                    >
                                        ×
                                    </Button></td>
                                    <td><input 
                                        value={this.props.b[ind].appname}
                                        key={`sobj-chngname-b-inp-${ind}`}
                                        onChange={this.props.changeName('base', ind)}
                                    /></td>
                                    <td><Button keyprop={`sobj-choosebase-b-btn-${ind}`}
                                        option='small'
                                        clickHandler={this.props.chooseObj('base', ind)}
                                    >
                                        Configure
                                    </Button></td>
                                </tr>
                            );
                        })}
                    </tbody></table>
                    <h4>Data Entry Records</h4>
                    <table><tbody>
                        {this.props.r.map((val,ind) => {
                            return (
                                <tr>
                                    <td><Button keyprop={`sobj-delobj-r-btn-${ind}`}
                                        option='small'
                                        clickHandler={this.props.delObj('record', ind)}
                                    >
                                        ×
                                    </Button></td>
                                    <td><input 
                                        value={this.props.r[ind].appname}
                                        key={`sobj-chngname-r-inp-${ind}`}
                                        onChange={this.props.changeName('record', ind)}
                                    /></td>
                                    <td><Button keyprop={`sobj-chooseobj-r-btn-${ind}`}
                                        option='small'
                                        clickHandler={this.props.chooseObj('record', ind)}
                                    >
                                        Configure
                                    </Button></td>
                                </tr>
                            );
                        })}
                    </tbody></table>
                </div>
                <div className={styles.filterDivParent}>
                    <div className={styles.filterDiv}>
                        <span style={{marginRight: 15}}>Search for Salesforce Objects:</span>
                        <input 
                            type='text'
                            onChange={(e) => this.setState({ filterText: e.target.value })}
                            value={this.state.filterText}
                        />
                    </div>
                </div>
                <div className={styles.allObjects}>
                    <table class={styles.allList}><tbody>
                        {this.props.sObjects
                            .filter((val) => {
                                if (this.state.filterText === '') return true;
                                if (val.label.toUpperCase().includes(this.state.filterText.toUpperCase())) return true;
                                if (val.name.toUpperCase().includes(this.state.filterText.toUpperCase())) return true;
                                return false;
                            }).map((val, ind) => {
                                return (
                                    <tr 
                                        key={`sobj-list-${ind}`}
                                    > 
                                        <td style={{textAlign: 'left',}}>{val.label}</td>
                                        <td><Button keyprop={`sobj-addbase-btn-${ind}`}
                                            option='small'
                                            clickHandler={this.props.addObj('base', this.formObj(val.name))}
                                        >
                                            Add as Base
                                        </Button></td>
                                        <td><Button keyprop={`sobj-addrecord-btn-${ind}`}
                                            option='small'
                                            clickHandler={this.props.addObj('record', this.formObj(val.name))}
                                        >
                                            Add for Data Entry
                                        </Button></td>
                                    </tr>
                                );
                            })}
                    </tbody></table>
                </div>
            </div>
        );

        const buttons = [
            {
                name: 'Cancel',
                close: true,
            },
            {
                name: 'Create Config',
                clickHandler: this.props.submit,
                disabled: !(this.state.submittable),
            },
        ];

        return (
            <PopupContent
                keyprop={d.popups.length}
                class={styles.window}
                hash={this.props.hash}
            >
                {{
                    header: header,
                    body: body,
                    buttons: buttons,
                    closeHandler: ()=>{
                        console.log(`POPUP HASH: ${this.props.hash}`);
                        for (let i in d.popups) {
                            console.log(d.popups[i]);
                            if (d.popups[i].props && d.popups[i].props.hash === this.props.hash) {
                                d.popups.splice(i,1);
                                this.props.stateSetter(d);
                            }
                        }
                    },
                }}
            </PopupContent>
        );
    }
}
