import React, { Component } from 'react';

import './PanelColumn.css';

export default class PanelColumn extends Component {
    constructor(props) {
        super(props);
    }    

    render() {
        const style = this.props.style === undefined ? {} : this.props.style;

        return (
            <div className='panel-column' style={style}>
                {this.props.children}
            </div>
        );
    }
}