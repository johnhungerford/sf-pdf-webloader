import React, { Component } from 'react';

import Popup from './Popup.js';

import * as style from './PopupStack.module.css';

export default class PopupStack extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const modalStack = [];
        for (let i = 0; i < this.props.stack.length; i++) {
            modalStack.push(
                <Popup
                    options={this.props.stack[i].options}
                    buttons={this.props.stack[i].buttons}
                    zind={i + 10}
                    header={this.props.stack[i].header}
                >
                    {this.props.stack[i].content}
                </Popup>
            );
        }

        return (
            <div>
                {this.props.stack.map((modal,index) => {
                    return (
                        <Modal
                            options={modal.options}
                            buttons={modal.buttons}
                            zind={index + 10}
                            header={modal.header}
                        >
                            {modal.content}
                        </Modal>
                    );
                })}
            </div>
        );
    }
}
