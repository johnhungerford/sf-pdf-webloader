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
                            <Button 
                                class={styles.register}
                                clickHandler={() => {
                                    d.auth.register = true;
                                    d.auth.login = false;
                                    d.auth.loggedin = false;
                                    this.props.stateSetter(d);
                                }}
                            >
                                New User
                            </Button>
                        </div>
                    </div>
                </Panel>
            </div>
        );
    }
}