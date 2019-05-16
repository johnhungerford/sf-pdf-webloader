import React, { Component } from 'react';

import * as d from '../state';
import * as rn from '../render';

import PopupContent from '../common/PopupContent';
import Button from '../common/Button';

import * as styles from './SchemaConfigure.module.css';
import { runInNewContext } from 'vm';

export default class FieldSelector extends Component {
    constructor(props) {
        super(props);
        this.props.getFields((err) => {rn.renderErr(this.props.stateSetter, err.message)});
        this.state = {
            filterText: '',
        }
    }

    addField = (fieldkey) => () => {
        const field = this.formField(fieldkey);
        this.props.setState((oldState)=>{
            const newState = {
                ...oldState,
            }

            if (oldState.stage === 'base') {
                newState.b[oldState.index].fields = {...oldState.b[oldState.index].fields};
                newState.b[oldState.index].fields[fieldkey] = field;
                newState.fields[fieldkey].inuse = true;
            } else if (oldState.stage === 'record') {
                newState.r[oldState.index].fields = {...oldState.r[oldState.index].fields};
                newState.r[oldState.index].fields[fieldkey] = field;
                newState.fields[fieldkey].inuse = true;
            }

            return newState;
        });
    }

    delField = (key) => () => {
        this.props.setState((oldState)=>{
            const newState = {
                ...oldState,
            }
            
            let sfname;
            if (oldState.stage === 'base') {
                newState.b[oldState.index].fields = {...oldState.b[oldState.index].fields};
                delete newState.b[oldState.index].fields[key];
            } else if (oldState.stage === 'record') {
                newState.r[oldState.index].fields = {...oldState.r[oldState.index].fields};
                delete newState.r[oldState.index].fields[key];
            }

            newState.fields = {...oldState.fields};
            newState.fields[key].inuse = false;

            console.log(`key: ${key}`);
            console.log('newState:');
            console.log(newState);
            return newState;
        });
    }

    formField = (ind) => {
        const field = {
            appname: this.props.state.fields[ind].label,
            sfname: this.props.state.fields[ind].name,
        }

        if (!this.props.state.fields[ind].updateable) {
            field.noupdate = true;
            field.search = true;
        }

        switch (this.props.state.fields[ind].type) {
            case 'id':
                field.type = 'id';
                field.appname = 'Id';
                field.sfid = true;
                break;
            case 'textarea':
            case 'string':
                field.type = 'text';
                field.length = this.props.state.fields[ind].length;
                break;
            case 'picklist':
                field.type = 'picklist';
                field.values = this.props.state.fields[ind].picklistValues.map((val) => { return {label: val.label, value: val.value} });
                break;
            case 'double':
                field.type = 'number';
                break;
            case 'address':
                field.type = 'address';
                break;
            case 'phone':
                field.type = 'phone';
                break;
            case 'reference':
                field.type = 'index';
                field.indexto = this.props.state.fields[ind].referenceTo[0];
                break;
            case 'email':
                field.type = 'email';
                break;
            case 'date':
            case 'datetime':
                field.type = 'date';
                break;
            case 'boolean':
                field.type = 'boolean';
                break;
            case 'url':
                field.type = 'url';
                break;
        }

        return field;
    }

    setNecessary = (key) => () => {
        this.props.setState((oldState) => {
            const newState = {
                ...oldState,
            }

            if (this.props.state.stage === 'base') {
                if (newState.b[this.props.state.index].fields[key].necessary === undefined||
                    newState.b[this.props.state.index].fields[key].necessary === false)
                    newState.b[this.props.state.index].fields[key].necessary = true;
                else newState.b[this.props.state.index].fields[key].necessary = false;
                return newState;
            }

            if (newState.r[this.props.state.index].fields[key].necessary === undefined||
                newState.r[this.props.state.index].fields[key].necessary === false)
                newState.r[this.props.state.index].fields[key].necessary = true;
            else newState.r[this.props.state.index].fields[key].necessary = false;
            return newState;
        });
    };

    setAppName = (key) => (e) => {
        const value = e.target.value;
        this.props.setState((oldState) => {
            const newState = {
                ...oldState,
            }

            if (this.props.state.stage === 'base') {
                newState.b[oldState.index].fields[key] = {...oldState.b[oldState.index].fields[key]};
                newState.b[oldState.index].fields[key].appname = value;
                return newState;
            }

            newState.r[oldState.index].fields[key] = {...oldState.r[oldState.index].fields[key]};
            newState.r[oldState.index].fields[key].appname = value;
            return newState;
        });
    }

    chooseInheritsObj = (key) => (e) => {
        const value = e.target.value;
        this.props.setState((oldState) => {
            const newState = {
                ...oldState,
            }

            const field = this.props.state.stage === 'base' ? 
                newState.b[this.props.state.index].fields[key] : 
                newState.r[this.props.state.index].fields[key];

            if (value === '') return delete field.inherits;
            
            if (field.inherits === undefined) {
                field.inherits = { base: value };
                return newState;
            }

            field.inherits.base = value;
            return newState;
        });
    }

    chooseInheritsFld = (key) => (e) => {
        const value = e.target.value;
        this.props.setState((oldState) => {
            const newState = {
                ...oldState,
            }

            const field = this.props.state.stage === 'base' ? 
                newState.b[this.props.state.index].fields[key] : 
                newState.r[this.props.state.index].fields[key];
            
            if (value === '') return delete field.inherits.field;

            field.inherits.field = value;
            return newState;
        });
    }

    configureIndex = (key) => () => {
        this.props.setState((oldState) => {
            const newState = {
                ...oldState,
            }

            newState.field = key;
            newState.substage = 'indexconfig';
            return newState;
        });
    }

    setValue = (key) => (e) => {
        const value = e.target.value;
        this.props.setState((oldState) => {
            const newState = {
                ...oldState,
            }

            const field = this.props.state.stage === 'base' ? 
                newState.b[this.props.state.index].fields[key] : 
                newState.r[this.props.state.index].fields[key];
            
            if (value === '') return delete field.value;

            field.value = value;
            return newState;
        });
    }

    getInput = (field) => {
        let dataInput; 
        switch (field.type) {
        case 'id':
            dataInput = <span> </span>
            break;
        case 'text':
            if (field.length > 260) {
                dataInput = <textarea
                    rows='5' 
                    cols='45'
                    maxLength={field.length}
                    value={field.value === null ? '' : field.value}
                    onChange={this.setValue(field.sfname)}
                />;
            } else {
                dataInput = <input 
                    className={styles.dataInput}
                    type='text' 
                    size='45' 
                    maxLength={field.length}
                    value={field.value === null ? '' : field.value}
                    onChange={this.setValue(field.sfname)}
                />;
            }
            break;
        case 'phone':
            dataInput = <input 
                className={styles.dataInput} 
                type='text' 
                size='45' 
                maxLength='40' 
                value={field.value === null ? '' : field.value}
                onChange={this.setValue(field.sfname)}
            />;
            break;
        case 'url':
            dataInput = <input 
                className={styles.dataInput} 
                type="text" 
                size="50" 
                value={field.value === null ? '' : field.value}
                onChange={this.setValue(field.sfname)}
            />;
            break;
        case 'email':
            dataInput = <input 
                className={styles.dataInput} 
                type='text' 
                size='45' 
                maxLength={field.length}
                value={field.value === null ? '' : field.value}
                onChange={this.setValue(field.sfname)}
            />;
            break;
        case 'picklist':
            dataInput = <select 
                className={styles.dataInput}
                onKeyPress={this.enterHandler}
                value={field.value === null ? '' : field.value}
                onChange={this.setValue(field.sfname)}
            >
                <option value=''>None</option>
                {field.values.map((val,ind)=>{
                    return <option 
                        key={`input-picklist-${ind}`}
                        value={val.value ? val.value : val}
                    >{val.label ? val.label : val}</option>;
                })}
            </select>;
            break;
        case 'date':
            dataInput = <input 
                className={styles.dataInput} 
                type='text' 
                maxLength="100" 
                value={field.value === null ? '' : field.value}
                onChange={this.setValue(field.sfname)}
            />;
            break;
        case 'index':
            dataInput = <span>{field.value === undefined || field.value === '' ?
                `Configure Related Fields >>` : 
                field.showval === undefined || field.showval === '' ?
                field.value : field.showval}</span> 
            break;
        case 'boolean':
            dataInput = <input 
                className={styles.dataInput} 
                type='checkbox'
                checked={field.value}
                onChange={this.setValue(field.sfname)}
            />;
            break;
        default:
            break;       
        }

        return dataInput
    }

    render = () => {
        if (Object.keys(this.props.state.fields) === 0) return <div></div>;
        console.log(`fields:`);
        console.log(this.props.state.fields);
        const header = `Select Fields for "${this.props.state.stage === 'base' ? this.props.state.b[this.props.state.index].appname : this.props.state.r[this.props.state.index].appname}"`;
        
        const selectedFields = {...this.props.state.stage === 'base' ?
            this.props.state.b[this.props.state.index].fields :
            this.props.state.r[this.props.state.index].fields};
        const selectedFieldsDisplay = [];
        for (let key in selectedFields) {
            if (this.props.state.stage === 'record') {
                const inheritFields = [];
                if (selectedFields[key].inherits &&
                    selectedFields[key].inherits.base) {
                    for (let i in this.props.state.b[selectedFields[key].inherits.base].fields) {
                        inheritFields.push((
                            <option key={`inherits-sobj-fields-dropdown-${i}`} value={i}>
                                {i}
                            </option>
                        ));
                    }
                }

                selectedFieldsDisplay.push((
                    <tr>
                        <td><Button keyprop={`sobj-addbase-btn-${key}`}
                            clickHandler={this.delField(key)}
                            disabled={selectedFields[key].type === 'id'}
                            option='small'
                        >
                            ×
                        </Button></td>
                        <td><input 
                            type='text'
                            value={selectedFields[key].appname ? selectedFields[key].appname : selectedFields[key].sfname}
                            disabled={selectedFields[key].type === 'id' || (selectedFields[key].inherits && selectedFields[key].inherits.base)}
                            onChange={this.setAppName(key)}
                        /></td>
                        <td>{this.getInput(selectedFields[key])}</td>
                        <td><input 
                            type='checkbox'
                            disabled={selectedFields[key].value !== undefined && selectedFields[key].value !== ''}
                            keyprop={`fld-necessary-chk-${key}`}
                            checked={selectedFields[key].necessary}
                            onChange={this.setNecessary(key)} 
                        /></td>
                        <td><select 
                            keyprop={`fld-inherits-dropdown-${key}`} 
                            disabled={selectedFields[key].type === 'id' || (selectedFields[key].value !== undefined && selectedFields[key].value !== '')}
                            value={(selectedFields[key].inherits && selectedFields[key].inherits.base) ? selectedFields[key].inherits.base : ''}
                            onChange={this.chooseInheritsObj(key)}
                        >
                            <option 
                                key={`fld-inherits-sobj-dropdown-none`}
                                value=''
                            >
                                Choose Object
                            </option>
                            {this.props.state.b.map((val, ind) => {
                                return (
                                    <option 
                                        key={`fld-inherits-sobj-dropdown-${ind}`} 
                                        value={ind}
                                    >
                                        {val.appname}
                                    </option>
                                );
                            })}
                        </select></td>
                        <td><select 
                            keyprop={`fld-inherits-fld-dropdown-${key}`} 
                            onChange={this.chooseInheritsFld(key)}
                            value={(selectedFields[key].inherits && selectedFields[key].inherits.field) ? selectedFields[key].inherits.field : ''}
                            disabled={selectedFields[key].type === 'id' || inheritFields.length === 0 || (selectedFields[key].value !== undefined && selectedFields[key].value !== '')}
                        >
                            <option 
                                key={`fld-inherits-sobj-dropdown-none`}
                                value=''
                            >
                                Choose Field
                            </option>
                            {inheritFields}
                        </select></td>
                        <td><Button keyprop={`fld-config-index-${key}`}
                            option='small'
                            clickHandler={this.configureIndex(key)}
                            disabled={selectedFields[key].type !== 'index' || (selectedFields[key].inherits && selectedFields[key].inherits.base)}
                        >
                            Configure
                        </Button></td>
                    </tr>
                ));
            }

            if (this.props.state.stage === 'base') {
                selectedFieldsDisplay.push((
                    <tr>
                        <td><Button keyprop={`sobj-addbase-btn-${key}`}
                            option='small'
                            clickHandler={this.delField(key)}
                            disabled={selectedFields[key].type === 'id'}
                        >
                            ×
                        </Button></td>
                        <td><input 
                            type='text'
                            value={selectedFields[key].appname ? selectedFields[key].appname : selectedFields[key].sfname}
                            disabled={selectedFields[key].type === 'id' || (selectedFields[key].inherits && selectedFields[key].inherits.base)}
                            onChange={this.setAppName(key)}
                        /></td>
                        <td>{this.getInput(selectedFields[key])}</td>
                        <td><input 
                            type='checkbox'
                            disabled={selectedFields[key].type === 'id' || selectedFields[key].value !== undefined && selectedFields[key].value !== ''}
                            keyprop={`fld-necessary-chk-${key}`}
                            value={selectedFields[key].necessary}
                            onChange={this.setNecessary(key)} 
                        /></td>
                        <td><Button keyprop={`fld-config-index-${key}`}
                            option='small'
                            clickHandler={this.configureIndex(key)}
                            disabled={selectedFields[key].type !== 'index' || (selectedFields[key].inherits && selectedFields[key].inherits.base)}
                        >
                            Configure
                        </Button></td>
                    </tr>
                ));
            }
        }

        const allFieldsDisplay = [];
        for (let i in this.props.state.fields) {
            let val = this.props.state.fields[i];
            if (val.inuse) continue;
            if (val.type === 'id') continue;
            if (this.state.filterText === '' ||
                val.label.toUpperCase().includes(this.state.filterText.toUpperCase()) ||
                val.name.toUpperCase().includes(this.state.filterText.toUpperCase())
            ) {
                allFieldsDisplay.push((
                    <tr 
                        key={`sffield-list-${val.name}`}
                    > 
                        <td style={{textAlign: 'left'}}>{val.label}</td>
                        <td><Button keyprop={`sffield-add-btn-${val.name}`}
                            option='small'
                            clickHandler={this.addField(val.name)}
                        >
                            Add Field
                        </Button></td>
                    </tr>
                ));
            }
        }

        let selectedFieldsListHeader; 
        if (this.props.state.stage === 'record') {
            selectedFieldsListHeader = (
                <tr><th></th>
                <th>Field Name</th>
                <th>Set Value</th>
                <th>Necessary?</th>
                <th>Inherit: Object</th>
                <th>Inherit: Field</th>
                <th>Configure Related Fields</th></tr>
            );
        } else {
            selectedFieldsListHeader = (
                <tr><th></th>
                <th>Field Name</th>
                <th>Set Value</th>
                <th>Necessary?</th>
                <th>Configure Related Fields</th></tr>
            );
        }   

        const body = (
            <React.Fragment>
                <div className={styles.addedObjects}>
                    <h4>Selected Fields</h4>
                    <table>
                        <thead>
                            {selectedFieldsListHeader}
                        </thead>
                        <tbody>
                            {selectedFieldsDisplay}
                        </tbody>
                    </table>
                </div>
                <div className={styles.filterDivParent}>
                    <div className={styles.filterDiv}>
                        <span style={{marginRight: 15}}>Search for Salesforce Fields: </span>
                        <input 
                            type='text'
                            onChange={(e) => this.setState({ filterText: e.target.value })}
                            value={this.state.filterText}
                        />
                    </div>
                </div>
                <div className={styles.allObjects}>
                    <table>
                        <tbody>
                            {allFieldsDisplay}
                        </tbody>
                    </table>
                </div>
            </React.Fragment>
        );

        const buttons = [
            {
                name: 'Previous',
                clickHandler: this.props.prev,
            },
            {
                name: 'Cancel',
                close: true,
            },
            {
                name: 'Next',
                clickHandler: this.props.next,
            }
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
