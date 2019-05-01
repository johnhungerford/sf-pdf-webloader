import React, { Component } from 'react';

import Panel from '../common/Panel.js';
import Button from '../common/Button.js';

import * as rn from '../render';
import * as ajax from '../../logic/ajaxfunctions';

import styles from './Login.module.css';
import { runInNewContext } from 'vm';

export default class DataEntry extends Component {
    constructor(props) {
        super(props);
    }

    nameChange = (e) => {
        const value = e.target.value;
        this.props.stateSetter((currentState) => {
            return { 
                ...currentState, 
                auth: {
                    ...currentState.auth, 
                    username: value
                }
            };
        });
    }
    
    pwdChange = (e) => {
        const value = e.target.value;
        this.props.stateSetter((currentState) => {
            return { 
                ...currentState, 
                auth: {
                    ...currentState.auth, 
                    password: value
                }
            };
        });
    }

    submit = () => {
        ajax.postJSON(
            '/login',
            { 
                username: this.props.auth.username,
                password: this.props.auth.password,
            },
            (result) => {
                console.log(result);
                if (result.success) {
                    this.props.stateSetter((currentState)=>{
                        return { 
                            ...currentState, 
                            auth: {
                                ...currentState.auth, 
                                token: result.token,
                                loggedin: true,
                            }
                        };
                    });

                    return;
                }

                if (result.err) rn.renderErr(this.props.stateSetter, result.err);
            },
            (err) => { rn.renderErr(this.props.stateSetter, err.message) }
        );
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
                            Username: <input 
                                id='username' 
                                type='text' 
                                onChange={this.nameChange}
                            />
                        </div>
                        <div className={styles.password}>
                            Password: <input 
                                id='password' 
                                type='password' 
                                onChange={this.pwdChange}
                            />
                        </div>
                        <div className={styles.submit}>
                            <Button 
                                class={styles.login}
                                clickHandler={this.submit}
                            >Login</Button>
                            <Button class={styles.register}>Register</Button>
                        </div>
                        
                </Panel>
            </div>
        );
    }
}