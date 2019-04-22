import React, { Component } from 'react';

import './PanelRow.css';

export default class PanelRow extends Component {
    constructor(props) {
        super(props);
    }    

    render() {
        const style = this.props.style === undefined ? {} : this.props.style;

        return (
            <div className='panel-row' style={style}>
                {this.props.children}
            </div>
        );
    }
}