import React, { Component } from 'react';

import * as style from './Button.module.css';

export default class Button extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button className={`${style.button} ${this.props.class}`} onClick={this.props.clickHandler}>
                {this.props.children}
            </button>
        );
    }
}
