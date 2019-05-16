import React, { Component } from 'react';

import * as ajax from '../../logic/ajaxfunctions';
import * as rn from '../render';

import ObjectSelector from './ObjectSelector';
import FieldSelector from './FieldSelector';
import IndexConfigure from './IndexConfigure';
import SetOrder from './SetOrder';
import SetLayout from './SetLayout';

import * as styles from './SchemaConfigure.module.css';
import { normalize } from 'path';

export default class SchemaConfigure extends Component {
    constructor(props) {
        super(props);

        this.state = {
            path: [],
            sObjects: [],
            sObjMap: {},
            fields: {},
            b: [],
            r: [],
            stage: 'base', // 'record'
            index: 0,
            field: null,
            substage: 'objects', // 'fields', 'indexconfig', 'entryorder', 'layout', 'listorder'
        }
    }

    copyAll = (oldThing) => {
        console.log(oldThing);
        const newThing = oldThing instanceof Array ? 
            [...oldThing] : 
            oldThing instanceof Object ? { ...oldThing } : oldThing;
        
        if (!(newThing instanceof Object)) return newThing;
        for (let i in newThing) {
            newThing[i] = this.copyAll(newThing[i]);
        }

        return newThing;
    }

    stateSet = (fn) => this.setState(fn);

    changeName = (stage, ind) => (e) => {
        const value = e.target.value;
        this.setState((oldState) => {
            const newState = {...oldState};
            if (stage === 'base') newState.b[ind].appname = value;
            if (stage === 'record') newState.r[ind].appname = value;
            return newState;
        });
    }

    getObjects = (errCallback) => {
        const popId = rn.renderLoadingStart(this.props.stateSetter, 'Getting Salesforce objects metadata');
        ajax.getJSON(
            this.props.stateSetter,
            `/api/sobjects`,
            (result) => {
                rn.renderLoadingEnd(this.props.stateSetter, popId);
                if (!result.success) return rn.renderAlert(this.props.stateSetter, result.message, errCallback);
                this.setState((oldState) => {
                    const map = {...oldState.sObjMap};
                    for (let i in result.data) {
                        map[result.data[i].name] = i;
                    }

                    return {
                        ...oldState,
                        sObjects: result.data,
                        sObjMap: map,
                    }
                });
            },
            (err) => {
                rn.renderLoadingEnd(this.props.stateSetter, popId);
                rn.renderAlert(this.props.stateSetter, err.message, errCallback);
            }
        );
    }

    getFields = (errCallback) => {
        const sObject = this.state.stage == 'base' ?
            this.state.b[this.state.index].sobject :
            this.state.r[this.state.index].sobject;
        const popId = rn.renderLoadingStart(this.props.stateSetter, 'Getting Salesforce fields metadata');
        ajax.getJSON(
            this.props.stateSetter,
            `/api/sobjects/${sObject}/fields`,
            (result) => {
                rn.renderLoadingEnd(this.props.stateSetter, popId);
                if (!result.success) return rn.renderAlert(this.props.stateSetter, result.message, errCallback);
                const fields = {};
                for (let i in result.data) {
                    fields[result.data[i].name] = result.data[i];
                }

                this.setState((oldState) => {
                    return {
                        ...oldState,
                        fields: fields,
                    }
                });
            },
            (err) => {
                rn.renderLoadingEnd(this.props.stateSetter, popId);
                rn.renderAlert(this.props.stateSetter, err.message, errCallback);
            }
        );
    }

    addObj = (stage, obj) => {
        return () => {
            this.setState((oldState) => {
                const b = [...oldState.b];
                const r = [...oldState.r];
                if (stage === 'base') b.push(obj);
                if (stage === 'record') r.push(obj);
                const sObjects = [...oldState.sObjects];
                return {
                    ...oldState,
                    b: b,
                    r: r,
                    sObjects: sObjects,
                }
            });
        }
    }

    delObj = (stage, ind) => {
        return () => {
            this.setState((oldState) => {
                const b = [...oldState.b];
                const r = [...oldState.r];
                const sObjects = [...oldState.sObjects];
                if (stage === 'base') {
                    b.splice(ind, 1);
                }
    
                if (stage === 'record') {
                    r.splice(ind, 1);
                }
    
                return {
                    ...oldState,
                    b: b,
                    r: r,
                    sObjects: sObjects,
                }
            });
        }
    }

    chooseObj = (stage, objind) => {
        return () => {
            this.setState((oldState) => {
                return {
                    ...oldState,
                    stage: stage,
                    index: objind,
                    substage: oldState.substage === 'objects' ? 'fields' : oldState.substage,
                }
            });
        }
    }

    addField = (field, fieldkey) => {
        return () => {
            this.setState((oldState) => {
                const newState = {
                    ...oldState,
                }
    
                if (this.state.stage === 'base') {
                    newState.b[this.state.index].fields = {...oldState.b[this.state.index].fields};
                    newState.b[this.state.index].fields[fieldkey] = field;
                } else if (this.state.stage === 'record') {
                    newState.r[this.state.index].fields = {...oldState.r[this.state.index].fields};
                    newState.r[this.state.index].fields[fieldkey] = field;
                }
    
                return newState;
            });
        }
    };

    delField = (fieldkey) => {
        return () => {
            this.setState((oldState) => {
                const newState = {
                    ...oldState,
                }
    
                if (this.state.stage === 'base') {
                    newState.b[this.state.index].fields = [...oldState.b[this.state.index].fields];
                    if (this.state.index < newState.b.length) delete newState.b[this.state.index].fields[fieldkey]; 
                } else if (stage === 'record') {
                    newState.r[objind].fields = [...oldState.r[objind.fields]];
                    if (objind < newState.r.length) delete newState.r[objind].fields[fieldkey]; 
                }
    
                return newState;
            });
        }
    };

    fnChooseField = (fieldkey) => {
        this.setState((oldState) => {
            return {
                ...oldState,
                field: fieldkey,
            }
        });
    }

    fnInsertSettings = (settings) => {
        this.setState((oldState) => {
            const newState = {
                ...oldState,
            }

            if (this.state.stage === 'base') {
                newState.b[this.state.index].settings = settings;
            } else if (this.state.stage === 'record') {
                newState.r[this.state.index].settings = settings;
            }

            return newState;
        });
    };

    fnIndexConfig = (fieldkey) => {
        this.setState((oldState) => {
            const newState = {
                ...oldState,
                field: fieldkey,
                substage: indexconfig,
            };

            return newState;
        });
    };

    next = (cb) => {
        let nextSubstage;
        switch(this.state.substage) {
            case 'objects':
                nextSubstage = 'fields';
                break;
            case 'fields':
                if (this.state.stage === 'base') nextSubstage = 'searchorder';
                else nextSubstage = 'entryorder';
                break;
            case 'indexconfig':
                if (this.state.stage === 'base') nextSubstage = 'searchorder';
                else nextSubstage = 'entryorder';
                break;
            case 'searchorder':
                nextSubstage = 'searchlayout';
                break;
            case 'searchlayout':
                nextSubstage = 'entryorder';
                break;
            case 'entryorder':
                nextSubstage = 'entrylayout';
                break;
            case 'entrylayout':
                nextSubstage = 'objects'
                break;
        }

        this.setState((oldState) => {
            return {
                ...oldState,
                substage: nextSubstage,
            };
        }, cb);
    }

    prev = (cb) => {
        let nextSubstage;
        switch(this.state.substage) {
            case 'fields':
                nextSubstage = 'objects';
                break;
            case 'indexconfig':
                nextSubstage = 'fields';
                break;
            case 'searchorder':
                nextSubstage = 'fields';
                break;
            case 'searchlayout':
                nextSubstage = 'searchorder';
                break;
            case 'entryorder':
                if (this.state.stage === 'base') nextSubstage = 'searchlayout';
                else nextSubstage = 'fields';
                break;
            case 'entrylayout':
                nextSubstage = 'entryorder';
        }

        console.log(`substage: ${this.state.substage}; nextSubstage: ${nextSubstage}`);

        this.setState((oldState) => {
            return {
                ...oldState,
                substage: nextSubstage,
            };
        }, cb);
    }


    render = () => {
        const s = this.state.stage;
        const b = this.state.b;
        const r = this.state.r;
        const i = this.state.index;
        const f = this.state.field;
        const hash = this.props.hash;
        console.log(this.state);
        switch(this.state.substage) {
            case 'objects':
                console.log('objects!');
                return (
                    <ObjectSelector 
                        type={s} 
                        b={this.state.b}
                        r={this.state.r}
                        changeName={this.changeName}
                        getObjects={this.getObjects}
                        sObjects={this.state.sObjects}
                        addObj={this.addObj}
                        delObj={this.delObj}
                        chooseObj={this.chooseObj}
                        next={this.next}
                        stateSetter={this.props.stateSetter}
                        hash={hash}
                    />
                );
            case 'fields':
                return (
                    <FieldSelector 
                        type={s}
                        fieldsobj={s === 'base' ? b[i].fields : r[i].fields}
                        state={this.state}
                        getFields={this.getFields}
                        addField={this.addField}
                        delField={this.delField}
                        next={this.next}
                        prev={this.prev}
                        setState={this.stateSet}
                        stateSetter={this.props.stateSetter}
                        hash={hash}
                    />
                );
            case 'indexconfig':
                return (
                    <IndexConfigure
                        type={s} 
                        field={s === 'base' ? b[i].fields[f] : b[i].fields[f]}
                        ins={this.fnInsertField}
                        level={0}
                        next={this.next}
                        stateSetter={this.props.stateSetter}
                        hash={hash}
                    />
                );
            case 'searchorder':
                return (
                    <SetOrder
                        fOrder={s === 'base' ? b[i].settings.searchorder : r[i].settings.searchorder}
                        sObj={s === 'base' ? b[i] : r[i]}
                        path={this.state.path}
                        copyAll={this.copyAll}
                        substage={this.state.substage}
                        setState={this.stateSet}
                        prev={this.prev}
                        next={this.next}
                        stateSetter={this.props.stateSetter}
                        hash={hash}
                    />
                );
            case 'entryorder':
                return (
                    <SetOrder
                        fOrder={s === 'base' ? b[i].settings.order : r[i].settings.order}
                        sObj={s === 'base' ? b[i] : r[i]}
                        path={this.state.path}
                        copyAll={this.copyAll}
                        substage={this.state.substage}
                        setState={this.stateSet}
                        prev={this.prev}
                        next={this.next}
                        stateSetter={this.props.stateSetter}
                        hash={hash}
                    />
                );
            case 'searchlayout':
            case 'entrylayout':
                return (
                    <SetLayout
                        type={s} 
                        substage={this.state.substage}
                        settings={s === 'base' ? b[i].settings : r[i].settings}
                        ins={this.fnInsertSettings}
                        next={this.next}
                        stateSetter={this.props.stateSetter}
                        hash={hash}
                    />      
                )
        }
    }
}
