import React, { Component } from 'react';

import Panel from '../common/Panel.js';
import Button from '../common/Button.js';

import * as d from '../state';
import * as rn from '../render';
import * as ajax from '../../logic/ajaxfunctions';

import styles from './Login.module.css';

export default class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password1: '',
            password2: '',
            email1: '',
            email2: '',
            err: false,
            errMessage: '',
        }
    }

    submit = () => {            
        if (
            this.state.username.length < 6 ||
            this.state.username.search(';') > -1 ||
            !/^[A-Za-z0-9_-]+$/.test(this.state.username)
        ) {
            return this.setState((oldState) => {
                return {
                    ...oldState,
                    err: true,
                    errMessage: 'Invalid username: must be more than 5 characters and contain only alphanumeric characters and "-", "_"',
                }
            });
        }
    
        if (this.state.password1 !== this.state.password2) {
            return this.setState((oldState) => {
                return {
                    ...oldState,
                    err: true,
                    errMessage: `Passwords do not match!`,
                }
            });
        }

        if (
            this.state.password1.length < 8 ||
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&~])/.test(this.state.password1)
        ) {
            return this.setState((oldState) => {
                return {
                    ...oldState,
                    err: true,
                    errMessage: `Invalid password: must be more than 7 characters and contain at least one lower case letter, one uppercase letter, one numerical digit, and one special character (!@#$%^&~)`,
                }
            });
        }
    
        if(this.state.email1 !== this.state.email2) {
            return this.setState((oldState) => {
                return {
                    ...oldState,
                    err: true,
                    errMessage: `Emails do not match!`,
                }
            });
        }

        const reEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        if (!reEmail.test(this.state.email1)) {
            return this.setState((oldState) => {
                return {
                    ...oldState,
                    err: true,
                    errMessage: `Invalid email address`,
                }
            });
        }

        ajax.postJSON(
            this.props.stateSetter,
            '/login/register',
            { 
                username: this.state.username,
                password: this.state.password1,
                email: this.state.email1,
            },
            (result) => {
                if (!result.success) {
                    this.setState((oldState) => {
                        return {
                            ...oldState,
                            err: true,
                            errMessage: result.message,
                        }
                    });

                    return;
                }

                console.log('Successful registration!');
                d.auth.username = this.state.username;
                d.auth.promptlogin = true;
                d.auth.loggedin = false;
                d.auth.register = false;
                console.log(d);
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
                        <h1>Register</h1>
                        <div className={styles.textinputs}>
                            <div className={styles.error}>
                                {this.state.err ? this.state.errMessage : null}
                            </div>
                            <div className={styles.userName}>
                                Username: <input 
                                    type='text'
                                    value={this.state.username} 
                                    onChange={(e)=>{
                                        const value = e.target.value;
                                        return this.setState((oldState) => {
                                            return {
                                                ...oldState,
                                                username: value,
                                            }
                                        });
                                    }}
                                />
                            </div>
                            <div className={styles.password}>
                                Password: <input 
                                    id='password' 
                                    type='password'
                                    value={d.auth.password} 
                                    onChange={(e)=>{
                                        const value = e.target.value;
                                        return this.setState((oldState) => {
                                            return {
                                                ...oldState,
                                                password1: value,
                                            }
                                        });
                                    }}
                                />
                            </div>
                            <div className={styles.password}>
                                Re-enter Password: <input 
                                    id='password' 
                                    type='password'
                                    value={d.auth.password} 
                                    onChange={(e)=>{
                                        const value = e.target.value;
                                        return this.setState((oldState) => {
                                            return {
                                                ...oldState,
                                                password2: value,
                                            }
                                        });
                                    }}
                                />
                            </div>
                            <div className={styles.password}>
                                Email: <input 
                                    id='password' 
                                    type='text'
                                    value={d.auth.password} 
                                    onChange={(e)=>{
                                        const value = e.target.value;
                                        return this.setState((oldState) => {
                                            return {
                                                ...oldState,
                                                email1: value,
                                            }
                                        });
                                    }}
                                />
                            </div>
                            <div className={styles.password}>
                                Re-enter Email: <input 
                                    id='password' 
                                    type='text'
                                    value={d.auth.password} 
                                    onChange={(e)=>{
                                        const value = e.target.value;
                                        return this.setState((oldState) => {
                                            return {
                                                ...oldState,
                                                email2: value,
                                            }
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <div className={styles.submit}>
                            <Button 
                                class={styles.login}
                                clickHandler={this.submit}
                            >
                                Register
                            </Button>
                            <Button 
                                class={styles.register}
                                clickHandler={()=>{
                                    d.auth.loggedin = false;
                                    d.auth.username = this.state.username;
                                    d.auth.password = '';
                                    d.auth.promptlogin = true;
                                    d.auth.register = false;
                                    this.props.stateSetter(d);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Panel>
            </div>
        );
    }
}