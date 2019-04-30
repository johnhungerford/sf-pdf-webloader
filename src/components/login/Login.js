import React, { Component } from 'react';

import Panel from '../common/Panel.js';
import Button from '../common/Button.js';

import styles from './Login.module.css';

export default class DataEntry extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={styles.outerDiv}>
                <Panel 
                    outerClass={styles.panelOuter}
                    innerClass={styles.innerPanel}
                >
                        <h1>Login</h1>
                        <div className={styles.userName}>
                            Username: <input id='username' type='text' />
                        </div>
                        <div className={styles.password}>
                            Password: <input id='password' type='password' />
                        </div>
                        <div className={styles.submit}>
                            <Button class={styles.login}>Login</Button>
                            <Button class={styles.register}>Register</Button>
                        </div>
                        
                </Panel>
            </div>
        );
    }
}