import React, { Component } from 'react';

import Panel from '../common/Panel.js';
import Button from '../common/Button.js';

import * as d from '../state';
import * as rn from '../render';
import * as ajax from '../../logic/ajaxfunctions';

import styles from './Login.module.css';
import { runInNewContext } from 'vm';

export default class DataEntry extends Component {
    constructor(props) {
        super(props);

        d.auth.password = null;
    }

    nameChange = (e) => {
        const value = e.target.value;
        d.auth.username = value;
        this.props.stateSetter(d);
    }
    
    pwdChange = (e) => {
        const value = e.target.value;
        d.auth.password = value;
        this.props.stateSetter(d);
    }

    submit = () => {
        console.log('submitted!');
        console.log(`username: ${this.props.auth.username} password: ${this.props.auth.password}`)
        ajax.postJSON(
            this.props.stateSetter,
            '/login',
            { 
                username: d.auth.username,
                password: d.auth.password,
            },
            (result) => {
                if (!result.success) {
                    return rn.renderErr(this.props.stateSetter, result.message);
                }

                d.auth.loggedin = true;
                d.auth.promptlogin = false;
                this.props.stateSetter(d);
            },
            (err) => { return rn.renderErr(this.props.stateSetter, err.message) }
        );
    }

    keyDownHandler = (e) => {
        if(e.keyCode === 13) this.submit();
    }

    render() {
        return (
            <div 
                className={styles.outerDiv}
                tabIndex='0'
                onKeyDown={this.keyDownHandler}
            >
                <Panel 
                    outerClass={styles.panelOuter}
                    innerClass={styles.panelInner}
                >
                    <div className={styles.container}>
                        <h1>Login</h1>
                        <div className={styles.textinputs}>
                            <div className={styles.userName}>
                                Username: <input 
                                    id='username' 
                                    type='text'
                                    value={d.auth.username} 
                                    onChange={this.nameChange}
                                />
                            </div>
                            <div className={styles.password}>
                                Password: <input 
                                    id='password' 
                                    type='password'
                                    value={d.auth.password} 
                                    onChange={this.pwdChange}
                                />
                            </div>
                        </div>
                        <div className={styles.submit}>
                            <Button 
                                class={styles.login}
                                clickHandler={this.submit}
                            >Login</Button>
                            <Button class={styles.register}>Register</Button>
                        </div>
                    </div>
                </Panel>
            </div>
        );
    }
}