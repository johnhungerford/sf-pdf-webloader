import React, { Component } from 'react';

import * as d from '../state';
import * as rn from '../render';

import PopupContent from '../common/PopupContent';
import Button from '../common/Button';

import * as styles from './SchemaConfigure.module.css';

class EditCondition extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            entry: this.copyAll(this.props.entry),
        }
    }

    copyAll = (oldThing) => {
        const newThing = oldThing instanceof Array ? 
            [...oldThing] : 
            oldThing instanceof Object ? { ...oldThing } : oldThing;
        
        if (!(newThing instanceof Object)) return newThing;
        for (let i in newThing) {
            newThing[i] = this.copyAll(newThing[i]);
        }

        return newThing;
    }

    submit = (cb) => this.props.update(this.state.entry, cb)();

    setSwitchValuesCb = (switchInd, valuesInd) => (e) => {
        if (e.type === 'keypress' && e.key !== 'Enter') return;
        const value = e.target.value;
        e.target.value = '';
        this.setState((oldState) => {
            const newState = this.copyAll(oldState);
            let values = newState.entry.switch[switchInd].value;
            if (valuesInd >= values.length) {
                values.push(value);
            } else {
                values[valuesInd] = value;
            }

            return newState;
        });
    }

    removeSwitchValueCb = (switchInd, valuesInd) => () => {
        this.setState((oldState) => {
            const newState = this.copyAll(oldState);
            newState.entry.switch[switchInd].value.splice(valuesInd,1);
            return newState;
        })
    }

    addSwitchCaseCb = (e) => {
        if (e.type === 'keypress' && e.key !== 'Enter') return;
        const value = e.target.value;
        e.target.value = '';
        this.setState((oldState) => {
            const newState = this.copyAll(oldState);
            newState.entry.switch.push({
                value: [value],
                order: [],
            });

            return newState;
        });
    }

    removeSwitchCaseCb = (ind) => () => {
        this.setState((oldState) => {
            const newState = this.copyAll(oldState);
            newState.entry.switch.splice(ind,1);
            return newState;
        });
    }

    addTrueCase = () => {
        this.setState((oldState) => {
            const newState = this.copyAll(oldState);
            newState.entry.true = [];
            return newState;
        })
    }

    removeTrueCase = () => {
        this.setState((oldState) => {
            const newState = this.copyAll(oldState);
            delete newState.entry.true;
            return newState;
        })
    }

    addFalseCase = () => {
        this.setState((oldState) => {
            const newState = this.copyAll(oldState);
            newState.entry.false = [];
            return newState;
        })
    }

    removeFalseCase = () => {
        this.setState((oldState) => {
            const newState = this.copyAll(oldState);
            delete newState.entry.false;
            return newState;
        })
    }

    setCondition = (e) => {
        const value = e.target.value;
        this.setState((oldState) => {
            const newState = this.copyAll(oldState);
            newState.entry.condition = value;
            if (value === 'switch') {
                if (!newState.entry.switch || !(newState.entry.switch instanceof Array)) {
                    newState.entry.switch = [];
                }
            }

            return newState;
        });
    }

    render = () => {
        const entry = this.state.entry;
        let optionsList;
        if (entry.condition === 'switch') {
            optionsList = entry.switch.map((val,ind) => {
                return (
                    <div>
                        <Button clickHandler={this.removeSwitchCaseCb(ind)}>x</Button>
                        {val.value.map((v,i) => {
                            if (this.props.sObj.fields[entry.field].type === 'picklist') {
                                return (
                                    <React.Fragment>
                                        <Button option='small' clickHandler={this.removeSwitchValueCb(ind, i)}>x</Button>
                                        <select value={v} onChange={this.setSwitchValuesCb(ind, i)}>
                                            <option value=''>None</option>
                                            {this.props.sObj.fields[entry.field].values.map((posv, posi) => {
                                                return (
                                                    <option value={posv.label}>{posv.label}</option>
                                                );
                                            })}
                                        </select>
                                    </React.Fragment>
                                );
                            }

                            return (
                                <React.Fragment>
                                    <Button option='small' clickHandler={this.removeSwitchValueCb(ind, i)}>x</Button>
                                    <input type='text' value={v} onChange={this.setSwitchValuesCb(ind, i)}/>
                                </React.Fragment>
                            );
                        })}
                        Add New Value:
                        {this.props.sObj.fields[entry.field].type === 'picklist' ? 
                            (<select onChange={this.setSwitchValuesCb(ind, val.value.length)}>
                                <option value=''>Add Value</option>
                                {this.props.sObj.fields[entry.field].values.map((posv, posi) => {
                                    return (
                                        <option value={posv.value}>{posv.label}</option>
                                    );
                                })}
                            </select>) : 
                            (<input type='text' defaultValue='' onKeyPress={this.setSwitchValuesCb(ind, val.value.length)}/>) 
                        }
                    </div>
                );
            });

            optionsList.push((
                <div>
                    Add new case:
                    {this.props.sObj.fields[entry.field].type === 'picklist' ? 
                            (<select onChange={this.addSwitchCaseCb}>
                                <option value=''>Add Value</option>
                                {this.props.sObj.fields[entry.field].values.map((posv, posi) => {
                                    return (
                                        <option value={posv.value}>{posv.label}</option>
                                    );
                                })}
                            </select>) : 
                            (<input type='text' defaultValue='' onKeyPress={this.addSwitchCaseCb}/>) 
                        }
                </div>
            ));
        }

        if (entry.condition === 'filled') {
            const trueElem = entry.true ? 
                <Button clickHandler={this.removeTrueCase}>Remove True Case</Button> :
                <Button clickHandler={this.addTrueCase}>Add True Case</Button>
            const falseElem = entry.false ?
                <Button clickHandler={this.removeFalseCase}>Remove False Case</Button> :
                <Button clickHandler={this.addFalseCase}>Add False Case</Button>

            optionsList = [trueElem, falseElem];
        }

        const body = (
            <div>
                Condition:
                <select
                    value={entry.condition}
                    onChange={this.setCondition}
                >
                    <option value=''>None</option>
                    <option value='switch'>Switch</option>
                    <option value='filled'>Has Value</option>
                </select>
                Options:
                {optionsList}
            </div>
        );

        const buttons = [
            {
                name: `Cancel`,
                close: true,
            },
            {
                name: `Update Condition`,
                close: true,
                clickHandler: (cb) => {
                    rn.renderAlert(
                        this.props.stateSetter, 
                        `The field order configured for any existing cases that were removed or replaced in this window will be permanently deleted. Continue?`, 
                        this.submit,
                    );
                }
            }
        ];

        return (
            <PopupContent>
                {{
                    header: this.props.entry.condition ? `Edit Condition` : `Add Condition`,
                    body: body,
                    buttons: buttons,
                    closeHandler: this.props.closeHandler
                }}
            </PopupContent>
        );
    }
}


export default class SetOrder extends Component {
    constructor(props) {
        super(props);
    }

    getfOrder = () => {
        return this.props.copyAll(this.props.fOrder);
    }

    getOrderArr = (arr, p) => {
        let ptrStack = [{ arr: arr === undefined ? this.getfOrder() : arr, i: 0}];
        let pCtr = 0;
        let arrCtr = 0;
        console.log(`p to be returned: ${p}`);
        console.log(`Path:`)
        console.log(this.props.path);
        while(pCtr < p && arrCtr >= 0) {
            console.log(`arr length: ${ptrStack[arrCtr].arr.length}; arr:`);
            console.log(ptrStack[arrCtr].arr);
            for(let i = ptrStack[arrCtr].i; i < ptrStack[arrCtr].arr.length; i++) {
                console.log(`pCtr: ${pCtr}; arrCtr: ${arrCtr}; i: ${i}`);
                if (ptrStack[arrCtr].arr[i].condition) {
                    let newPtr;
                    if (this.props.path[pCtr] !== 0) {
                        if (ptrStack[arrCtr].arr[i].condition === 'switch') newPtr = ptrStack[arrCtr].arr[i].switch[this.props.path[pCtr] - 1].order;
                        else if (this.props.path[pCtr] === 2) newPtr = ptrStack[arrCtr].arr[i].false;
                        else if (ptrStack[arrCtr].arr[i].true) newPtr = ptrStack[arrCtr].arr[i].true;
                        else newPtr = ptrStack[arrCtr].arr[i].false;
                        ptrStack.push({arr: newPtr, i: 0})
                        pCtr++;
                        arrCtr++;
                        break;
                    }

                    pCtr++;
                    if (pCtr === p) break;
                }

                if (i === ptrStack[arrCtr].arr.length - 1) {
                    arrCtr--;
                    break;
                }
            }
        }

        return ptrStack[arrCtr].arr === undefined ? ptrStack[0].arr : ptrStack[arrCtr].arr;
    }

    getOrderEntry = (p, i) => {
        return getOrderArr(fOrder, p)[i];
    }

    correctPath = (fOrder) => {
        let newPath = this.correctPathRecursive(fOrder)[1];
        return newPath;
    }

    correctPathRecursive = (arrIn, pIn, pathIn) => {
        let arr = arrIn === undefined ? [...this.getfOrder()] : [...arrIn];
        let p = pIn === undefined ? 0 : pIn;
        let path = pathIn === undefined ? [...this.props.path] : [...pathIn];

        for (let i in arr) {
            if (arr[i].condition) {
                if (p >= path.length) path.push(0);
                if (path[p] == 0) { 
                    p++; 
                    continue;
                }

                let nextArr;
                if (arr[i].condition === 'switch') nextArr = arr[i].switch[path[p] - 1].order;
                else if (path[p] == 2) nextArr= arr[i].false;
                else if (arr[i].true) nextArr = arr[i].true;
                else nextArr = arr[i].false;
                [p, path] = this.correctPathRecursive(nextArr, p + 1, path)
            }
        }

        return [p, path];
    }

    updatefOrder = (fOrder, cb) => {
        this.props.setState((oldState) => {
            const newState = {...oldState};
            const settings = newState.stage === 'base' ?
                newState.b[newState.index].settings :
                newState.r[newState.index].settings;
            
            if(newState.substage === 'searchorder') {
                settings.searchorder = fOrder;
            } else if (newState.substage === 'entryorder') {
                settings.order = fOrder;
            }

            newState.path = this.correctPath(fOrder);
            return newState;
        }, cb);
    }

    delEntryCb = (p, i, cb) => () => {
        const fOrder = this.getfOrder();
        this.getOrderArr(fOrder, p).splice(i,1);
        this.updatefOrder(fOrder, cb);
    }

    addEntryCb = (entry, p, i, cb) => () => {
        const fOrder = this.props.copyAll(this.props.fOrder);
        const arr = this.getOrderArr(fOrder, p);
        if (i === undefined || i >= arr.length) arr.push(entry);
        else arr.splice(i,0,entry);
        this.updatefOrder(fOrder, cb);
    }

    changeEntryCb = (entry, p, i, cb) => () => {
        const fOrder = this.getfOrder();
        const arr = this.getOrderArr(fOrder, p);
        if (i === undefined || i >= arr.length) return;
        arr.splice(i,1,entry);
        this.updatefOrder(fOrder, cb);
    }

    changeEntryGenCb = (p, i) => (entry, cb) => this.changeEntryCb(entry, p, i, cb);

    changePath(p, value) {
        this.props.setState((oldState) => {
            const newPath = [...oldState.path];
            if (p >= newPath.length) newPath.push(parseInt(value));
            else newPath[p] = parseInt(value);
            return {
                ...oldState,
                path: newPath,
            }
        })
    }

    addEntryPopup = (p, i) => () => {
        const fieldsArr = [];
        for (let key in this.props.sObj.fields) {
            fieldsArr.push((
                <div>
                    <span onClick={()=>{
                        d.popups.pop();
                        this.props.stateSetter(d, this.addEntryCb({field: key}, p, i));
                    }}
                    >{this.props.sObj.fields[key].appname}</span>
                </div>
            ));
        }

        const hash = 'hash' + Math.random().toString(36).substring(7);
        d.popups.push((
            <PopupContent
                hash={hash}
            >
                {{
                    header: `Select a Field:`,
                    body: (
                        <div>{fieldsArr}</div>
                    ),
                    buttons: [{name: `Cancel`, close: true, }],
                    closeHandler: ()=>{
                        for (let i in d.popups) {
                            if (d.popups[i].props && d.popups[i].props.hash === hash) {
                                d.popups.splice(i,1);
                                this.props.stateSetter(d);
                            }
                        }
                    },
                }}
            </PopupContent>
        ));
        this.props.stateSetter(d);
    } 

    editConditionPopup = (entry, p, i) => () => {
        const hash = 'hash' + Math.random().toString(36).substring(7);
        d.popups.push((
            <EditCondition
                entry={entry}
                hash={hash}
                update={this.changeEntryGenCb(p, i)}
                stateSetter={this.props.stateSetter}
                sObj={this.props.sObj}
                closeHandler={()=>{
                    for (let i in d.popups) {
                        if (d.popups[i].props && d.popups[i].props.hash === hash) {
                            d.popups.splice(i,1);
                            this.props.stateSetter(d);
                        }
                    }
                }}
            />
        ));
        this.props.stateSetter(d);
    }

    orderEntryElem = (entry, p, i) => {
        return (
            <div  key={`order-entry-${p}-${this.props.path[p]}-${i}`}>
                <div className={styles.invisAddBtnDiv}>
                    <span 
                        className={styles.invisAddBtn}
                        onClick={this.addEntryPopup(p, i)}
                    >+</span>
                </div>
                <div>
                    <Button
                        clickHandler={this.delEntryCb(p,i)}
                        option='small'
                    >x</Button>
                    <span>{this.props.sObj.fields[entry.field].appname}</span>
                    <Button
                        clickHandler={this.editConditionPopup(entry, p, i)}
                        option='small'
                    >{entry.condition ? 'Edit Condition' : 'Add Condition'}</Button>
                </div>
            </div>
        );
    }

    orderHeadingElem = (entry, p, i) => {
        let selectOptions = [];
        if (entry.condition === 'switch') {
            selectOptions = entry.switch.map((val, ind) => {
                return <option value={ind + 1}>{val.value.join(', ')}</option>;
            });

            selectOptions.splice(0,0, (<option value={0}>None</option>));
        } else {
            selectOptions.push((<option value={0}>Hide All</option>));
            if (entry.true) selectOptions.push((<option value={1}>True</option>));
            if (!entry.true) selectOptions.push((<option value={1}>False</option>));
            if (entry.true && entry.false) selectOptions.push((<option value={2}>False</option>));
        }

        return (
            <div key={`order-heading-${p}-${i}`}>
                <span>{entry.condition}</span>
                <select value={this.props.path[p]} onChange={(e)=>{this.changePath(p, e.target.value)}}>{selectOptions}</select>
            </div>
        );
    }

    addEntryButton = (p, i) => {
        return (
            <Button
                clickHandler={this.addEntryPopup(p, i)}
            >Add New Field</Button>
        );
    }

    getAllEntries = () => {
        return this.getAllEntriesRec(this.getfOrder(), 0)[0];
    }

    getAllEntriesRec = (arrIn, pIn) => {
        let arr = arrIn;
        let p = pIn;
        let pMap = pIn;
        const entries = [];
        for (let i in arr) {
            entries.push(this.orderEntryElem(arr[i], pMap, i));
            if (arr[i].condition) {
                entries.push(this.orderHeadingElem(arr[i], p, i));
                if (this.props.path[p] == 0) {
                    p++;
                    continue;
                }

                let nextArr;
                if (arr[i].condition === 'switch') nextArr = arr[i].switch[this.props.path[p] - 1].order;
                else if (this.props.path[p] == 2) nextArr= arr[i].false;
                else if (arr[i].true) nextArr = arr[i].true;
                else nextArr = arr[i].false;
                let nextEntries;
                [nextEntries, p] = this.getAllEntriesRec(nextArr, p + 1);
                entries.push(nextEntries);
            }
        }

        entries.push(this.addEntryButton(pMap));
        return [(
            <div className={styles.orderList}>{entries}</div>
        ), p];
    }

    render = () => {
        console.log('SetOrder state:');
        console.log(this.state);
        const header = `Set Field Order for ${this.props.substage === 'searchorder' ? 'Initial Search' : 'Data Entry'}`;
        const buttons = [
            {
                name: 'Prev',
                clickHandler: this.props.prev,
            },
            {
                name: 'Cancel',
                close: true,
            },
            {
                name: 'Next',
                clickHandler: this.props.next,
            },
        ];

        const body = (
            <div>
                {this.getAllEntries(this.props.fOrder, 0)}
            </div>
        );

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
