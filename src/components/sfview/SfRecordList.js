import React, { Component } from 'react';

import * as d from '../state';

import SfRecordEntry from './SfRecordEntry';

import styles from './SfRecordList.module.css';

export default class SfRecordList extends Component {
    constructor(props) {
        super(props);

        this.activeEntryRef = React.createRef();
        this.listScrollRef = React.createRef();
    };

    componentDidUpdate = this.componentDidMount = () => {
        console.log(this.activeEntryRef);
        console.log(this.listScrollRef);
        if (this.activeEntryRef.current === null || this.listScrollRef.current === null) return;

        const listWinScrollTop = this.listScrollRef.current.scrollTop;
        const listWinScrollBottom = this.listScrollRef.current.scrollTop + this.listScrollRef.current.offsetHeight;
        const activeEntryOffsetTop = this.activeEntryRef.current.offsetTop - this.listScrollRef.current.offsetTop;
        const activeEntryOffsetBottom = activeEntryOffsetTop + this.activeEntryRef.current.offsetHeight;    

        console.log(`listWinScrollTop: ${listWinScrollTop}\nlistWinScrollBottom: ${listWinScrollBottom}\nactiveEntryOffsetTop: ${activeEntryOffsetTop}\nactiveEntryOffsetBottom: ${activeEntryOffsetBottom}`);
        if (activeEntryOffsetBottom > listWinScrollBottom) {
            this.listScrollRef.current.scrollTo(0, activeEntryOffsetBottom - this.listScrollRef.current.offsetHeight + 5);
        } else if (activeEntryOffsetTop < listWinScrollTop) {
            this.listScrollRef.current.scrollTo(0, activeEntryOffsetTop - 5);
        }
        
        console.log(`listWinScrollTop: ${listWinScrollTop}\nlistWinScrollBottom: ${listWinScrollBottom}\nactiveEntryOffsetTop: ${activeEntryOffsetTop}\nactiveEntryOffsetBottom: ${activeEntryOffsetBottom}`);
    };

    render() {
        const baseList = [];
        for (let i = 0; i < d.dm.b.length; i++) {
            baseList.push((
                <SfRecordEntry 
                    keyprop={i}
                    type='base'
                    bi={i}
                    stateSetter={this.props.stateSetter}
                    refprop={i === d.ri ? this.activeEntryRef : null}
                />
            ));
        }

        const recordList = [];
        let oldri = -1;
        for (let i = d.dm.b.length; i < d.r.length; i++) {
            if (d.r[i].ri > oldri) {
                recordList.push((
                    <SfRecordEntry 
                        keyprop={`header-${d.r[i].ri}`}
                        type='heading'
                        ri={d.r[i].ri}
                        stateSetter={this.props.stateSetter}
                    />
                ));

                oldri = d.r[i].ri;
            }

            if (!d.r[i].delete) {
                recordList.push((
                    <SfRecordEntry 
                        keyprop={i}
                        type='record'
                        ri={i}
                        stateSetter={this.props.stateSetter}
                        refprop={i === d.ri ? this.activeEntryRef : null}
                    />
                ));
            }
        }

        return (
            <div 
                className={`${styles.recordList} ${this.props.class}`}
                ref={this.listScrollRef}
            > 
                <div>
                    {baseList}
                </div>
                <div>
                    {recordList}
                </div>
            </div>
        );
    }
}