import React, { Component } from 'react';

import Login from './login/Login'
import TopMenu from './topmenu/TopMenu.js';
import SfView from './sfview/SfView.js';
import DataEntry from './dataentry/DataEntry.js';
import DocView from './docview/DocView.js';
import PopupStack from './common/PopupStack.js';

import * as ajax from '../logic/ajaxfunctions';
import * as d from './state';

import styles from './App.module.css';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = require('./state.js');

        ajax.postJSON(
            `/login`,
            {},
            (data) => {
                if (data.success) {
                    return this.setState((currentState)=>{
                        return {
                            ...currentState,
                            auth: {
                                ...currentState.auth,
                                loggedin: true,
                            }
                        }
                    });
                }

                return this.setState((currentState)=>{
                    return {
                        ...currentState,
                        auth: {
                            ...currentState.auth,
                            promptlogin: true,
                        }
                    }
                });
            }
        );
    }

    stateSetter = (stateSet, cbAfter) => {
        if (stateSet instanceof Function) {
            this.setState(stateSet, cbAfter);
        } else {
            const obj = {};
            for (let i in stateSet) if (stateSet.hasOwnProperty(i)) obj[i] = stateSet[i];
            this.setState(obj, cbAfter);
        }   
    }

    render() {
        console.log(d);
        if (this.state.auth.promptlogin) {
            return (
                <div >
                    <Login 
                        auth={this.state.auth}
                        stateSetter={this.stateSetter}
                    />
                </div>
            )
        }

        console.log(this.state.auth);

        return (
            <div>
                <div>
                    <TopMenu
                        class={styles.menu} 
                        state={this.state}
                        config={this.state.config}
                        conn={this.state.conn}
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
                                url={this.state.docUrl}
                                stateSetter={this.stateSetter}
                            />
                        </div>
                    </div>
                </div>
                <PopupStack 
                    popups={this.state.popups} 
                    stateSetter={this.stateSetter}
                />
            </div>
        );
    }
}
