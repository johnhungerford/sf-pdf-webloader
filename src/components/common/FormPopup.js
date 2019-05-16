import React, { Component } from 'react';

import Button from '../common/Button';

import * as styles from './Popup.module.css';

export default class FormPopup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fields: [],
        }

        for (let i = 0; i < this.props.children.fields.length; i++) {
            this.state.fields.push({});
            if (this.props.children.fields[i].value) {
                this.state.fields[i].value = this.props.children.fields[i].value;
            } else {
                this.state.fields[i].value = '';
            }
        }
    }

    handleSubmit = () => {
        this.props.children.submitHandler(this.state.fields)
    }

    render() {
        const { header, fields, buttons } = this.props.children;
        const zindStyle = {
            zIndex: 'auto',
        };

        return (
            <div 
                style={zindStyle}
                className={`${styles.popup}`}
                key={`popup-content-${this.props.keyprop}`}
            >
                <div 
                    className={styles.closeBox}
                    onClick={this.props.children.closeCallback}
                >×</div>
                <div className={styles.header}>
                    <h3>{header}</h3>
                </div>
                <div className={styles.body}>
                    {fields.map((val,ind) => {
                        if (val.type === 'select') {
                            return (
                                <div key={`create-fields-${this.props.keyprop}-${ind}`}>
                                    <h5 key={`form-header-${this.props.keyprop}-${ind}`}>{val.label}</h5>
                                    <select 
                                        value={this.state.fields[ind].value}
                                        key={`form-fields-input-${this.props.keyprop}-${ind}`}
                                        onChange={(e)=>{
                                            const value = e.target.value;
                                            this.setState((oldState) => {
                                                const newState = {
                                                    ...oldState,
                                                    fields: [
                                                        ...oldState.fields
                                                    ],
                                                }

                                                newState.fields[ind].value = value;
                                                return newState;
                                            });
                                        }} 
                                    >
                                        {val.options.map((opt, optind) => (
                                            <option 
                                                value={opt.value}
                                                key={`option-${this.props.keyprop}-${ind}-${optind}`}
                                            >{opt.showval}</option>
                                        ))}
                                    </select>
                                </div>
                            );
                        }

                        return (
                            <div key={`create-fields-${this.props.keyprop}-${ind}`}>
                                <h5 key={`form-header-${this.props.keyprop}-${ind}`}>{val.label}</h5>
                                <input 
                                    type={val.type}
                                    value={this.state.fields[ind].value}
                                    key={`form-fields-input-${this.props.keyprop}-${ind}`}
                                    onChange={(e)=>{
                                        const value = e.target.value;
                                        this.setState((oldState) => {
                                            const newState = {
                                                ...oldState,
                                                fields: [
                                                    ...oldState.fields
                                                ],
                                            }

                                            newState.fields[ind].value = value;
                                            return newState;
                                        });
                                    }} 
                                />
                            </div>
                        );
                        
                    })}
                </div>
                <div className={styles.buttonDiv}>
                    <React.Fragment>
                        {buttons.map((button, ind) => {
                            if (button.type === 'submit') {
                                return (
                                    <Button 
                                        clickHandler={this.handleSubmit}
                                        class={styles.button}
                                    >
                                        {button.name}
                                    </Button>
                                )
                            }

                            return (
                                <Button 
                                    clickHandler={button.clickHandler}
                                    class={styles.button}
                                >
                                    {button.name}
                                </Button>
                            )
                        })}
                    </React.Fragment>
                </div>
            </div>
        );
    }
}
