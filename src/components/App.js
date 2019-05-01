import React, { Component } from 'react';

import Login from './login/Login'
import TopMenu from './topmenu/TopMenu.js';
import SfView from './sfview/SfView.js';
import DataEntry from './dataentry/DataEntry.js';
import DocView from './docview/DocView.js';
import PopupStack from './common/PopupStack.js';

import styles from './App.module.css';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = require('./state.js');
    }

    stateSetter = (input) => {
        if (input instanceof Function) {
            this.setState(input);
        } else {
            this.setState((currentState) => data);
        }   
    }

    render() {
        if (!this.state.auth.loggedin) return (
            <div>
                <Login 
                    auth={this.state.auth}
                    stateSetter={this.stateSetter}
                />
            </div>
        )

        return (
            <div>
                <div>
                    <TopMenu
                        class={styles.menu} 
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
                    stack={this.state.modals} 
                    stateSetter={this.stateSetter}
                />
            </div>
        );
    }
}
