import React, { Component } from 'react';

import * as styles from './Button.module.css';

export default class Button extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const dis = this.props.disabled === true ? true : false;

        const className = this.props.class ? this.props.option === 'small' ? `${styles.button} ${this.props.class} ${styles.small}` : `${styles.button} ${this.props.class}` : this.props.option === 'small' ? `${styles.button} ${styles.small}` : styles.button;

        if (this.props.type === 'file' && !dis) {
            return (
                <span className={className}>
                    {this.props.children}
                    <input 
                        className={styles.fileInput}
                        style={this.props.style}
                        type='file' 
                        onChange={this.props.fileLoadHandler}
                        ref={this.props.setRef}
                        disabled={dis}
                    />
                </span>
            )
        }

        return (
            <button 
                className={className} 
                style={this.props.style}
                onClick={dis ? ()=>null : this.props.clickHandler}
                ref={this.props.setRef}
                disabled={dis}
            >
                {this.props.children}
            </button>
        );
    }
}
