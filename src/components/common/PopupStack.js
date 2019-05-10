import React, { Component } from 'react';

import Popup from './Popup.js';
import FormPopup from './FormPopup';

import * as style from './PopupStack.module.css';

export default class PopupStack extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        const popupStack = [];
        for (let i = 0; i < this.props.popups.length; i++) {
            if (this.props.popups[i].type === 'form') {
                popupStack.push(
                    <FormPopup
                        zind={i + 100}
                        keyprop={`popup-${i}`}
                        stateSetter={this.props.stateSetter}
                        top={i === this.props.popups.length - 1}
                    >
                        {{
                            type: 'form',
                            header: this.props.popups[i].header,
                            fields: this.props.popups[i].fields,
                            buttons: this.props.popups[i].buttons,
                            fm: this.props.popups[i].fm,
                            callback: this.props.popups[i].callback,
                        }}
                    </FormPopup>
                );
                
                continue;
            }
            popupStack.push(
                <Popup
                    zind={i + 100}
                    keyprop={`popup-${i}`}
                    stateSetter={this.props.stateSetter}
                    top={i === this.props.popups.length - 1}
                >
                    {{
                        type: this.props.popups[i].type,
                        header: this.props.popups[i].header,
                        body: this.props.popups[i].body,
                        buttons: this.props.popups[i].buttons,
                    }}
                </Popup>
            );
        }

        return (
            <div>
                {popupStack}
            </div>
        );
    }
}
