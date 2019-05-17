import React, { Component } from 'react';

import Login from './login/Login';
import Register from './login/Register';
import TopMenu from './topmenu/TopMenu.js';
import SfView from './sfview/SfView.js';
import DataEntry from './dataentry/DataEntry.js';
import DocView from './docview/DocView.js';
import PopupStack from './common/PopupStack.js';

import * as ajax from '../logic/ajaxfunctions';
import * as rf from '../logic/recarrayfunctions';
import * as rn from './render';
import * as d from './state';

import styles from './App.module.css';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = require('./state.js');

        document.addEventListener('keydown', this.keyDownHandler);

        ajax.postJSON(
            this.props.stateSetter,
            `/login`,
            { test: true },
            (data)=>{
                if (data.success) {
                    d.auth.promptlogin = false;
                    d.auth.loggedin = true;
                    this.setState(d);
                }
            }
        );
    }

    keyDownHandler = (e) => {
        if (d.stage === 'off' || d.popups.length > 0) return;

        switch(document.activeElement.tagName) {
            case 'INPUT':
            case 'TEXTAREA':
                if (e.keyCode === 27) document.activeElement.blur();
                return;
        }

        switch(e.keyCode) {
            case 13:
                e.preventDefault();
                d.fldentry.submit = true;
                d.fldentry.next = true;
                break;
            case 32:
                if (document.activeElement.tagName === 'SELECT') return;
                e.preventDefault();
                d.fldentry.focus = true;
                break;
            case 39:
                e.preventDefault();
                if (d.fldentry.value !== d.fldentry.oldval) {
                    rn.renderAlert(
                        this.stateSetter, 
                        'Leaving this field will erase changes. Proceed?',
                        () => rf.nextf()
                    )
                    return;
                } else rf.nextf();
                break;
            case 37:
                e.preventDefault();
                if (d.fldentry.value !== d.fldentry.oldval) {
                    rn.renderAlert(
                        this.stateSetter, 
                        'Leaving this field will erase changes. Proceed?',
                        () => rf.prevf()
                    )
                    return;
                } else rf.prevf();
                break;
            case 38:
                if (document.activeElement.tagName === 'SELECT') return;
                e.preventDefault();
                if (d.fldentry.value !== d.fldentry.oldval) {
                    rn.renderAlert(
                        this.stateSetter, 
                        'Leaving this field will erase changes. Proceed?',
                        () => rf.prevr()
                    )
                    return;
                } else rf.prevr();
                break;
            case 40:
                if (document.activeElement.tagName === 'SELECT') return;
                e.preventDefault();
                if (d.fldentry.value !== d.fldentry.oldval) {
                    rn.renderAlert(
                        this.stateSetter, 
                        'Leaving this field will erase changes. Proceed?',
                        () => rf.nextr()
                    )
                    return;
                } else rf.nextr();
                break;
        }

        this.stateSetter(d);
    }

    stateSetter = (stateSet, cbAfter) => {
        if (stateSet instanceof Function) {
            this.setState(stateSet, cbAfter);
        } else {
            const obj = {};
            for (let i in stateSet) if (stateSet.hasOwnProperty(i)) obj[i] = stateSet[i];
            this.setState(obj, (data)=>{
                if (cbAfter instanceof Function) cbAfter(data);
            });
        }
    }

    render() {
        if (d.auth.register) return (<div>
            <Register stateSetter={this.stateSetter}/>
            <PopupStack popups={d.popups} stateSetter={this.stateSetter}/>
        </div>);
        if (d.auth.promptlogin) return (<div >
            <Login stateSetter={this.stateSetter}/>
            <PopupStack popups={d.popups} stateSetter={this.stateSetter}/>
        </div>);

        return (
            <div 
                className={styles.window}
            >
                <div>
                    <TopMenu
                        class={styles.menu} 
                        stateSetter={this.stateSetter}
                    />
                    <div className={styles.outerDiv}>
                        <SfView 
                            class={styles.sfView}
                            stateSetter={this.stateSetter}
                        >
                            This is the Salesforce viewer...
                        </SfView>
                        <div className={styles.innerDiv}>
                            <DataEntry 
                                class={styles.dataEntry}
                                stateSetter={this.stateSetter}
                            />
                            <DocView 
                                class={styles.docView} 
                                stateSetter={this.stateSetter}
                            />
                        </div>
                    </div>
                </div>
                <PopupStack 
                    popups={d.popups} 
                    stateSetter={this.stateSetter}
                />
            </div>
        );
    }
}
