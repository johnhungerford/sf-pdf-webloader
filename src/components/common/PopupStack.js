import React, { Component } from 'react';

import Popup from './Popup.js';

export default class PopupStack extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {this.props.popups.map((val,ind) => {
                    return (
                        <Popup 
                            keyprop={`popupStack-${ind}`}
                            top={ind === this.props.popups.length - 1 ? true : false}
                            zind={ind + 100}
                        >
                            {val}
                        </Popup>
                    );
                })}
                {this.props.popups}
            </div>
        );
    }
}
