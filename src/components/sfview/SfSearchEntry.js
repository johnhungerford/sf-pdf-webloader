import React, { Component } from 'react';

import styles from './SfSearchEntry.module.css';

export default class SfSearchEntry extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div 
                key={this.props.keyprop}
                className={styles.entry}
                onClick={this.props.clickHandler}
            > 
                {this.props.children}
            </div>
        );
    }
}
