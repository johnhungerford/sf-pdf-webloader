import React, { Component } from 'react';

import Popup from './Popup.js';

import * as style from './PopupStack.module.css';

export default class PopupStack extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const popupStack = [];
        for (let i = 0; i < this.props.popups.length; i++) {
            popupStack.push(
                <Popup
                    options={this.props.popups[i].options}
                    buttons={this.props.popups[i].buttons}
                    zind={i + 10}
                    header={this.props.popups[i].header}
                >
                    {this.props.popups[i].content}
                </Popup>
            );
        }

        return (
            <div>
                {this.props.popups.map((modal,index) => {
                    return (
                        <Modal
                            options={modal.options}
                            buttons={modal.buttons}
                            zind={index + 10}
                            header={modal.header}
                            key={index}
                        >
                            {modal.content}
                        </Modal>
                    );
                })}
            </div>
        );
    }
}
