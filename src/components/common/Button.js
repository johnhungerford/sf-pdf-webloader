import React, { Component } from 'react';

import * as style from './Button.module.css';

export default class Button extends Component {
    constructor(props) {
        super(props);
        this.clickHandler = this.props.clickHandler;
    }

    render() {
        return (
            <button className={`${style.button} ${this.props.class}`} onClick={this.clickHandler}>
                {this.props.children}
            </button>
        );
    }
}
