import React, { Component } from 'react';

import * as mf from '../../logic/mapfunctions';
import * as sf from '../../logic/searchfunctions';
import * as d from '../state';

import SfSearchEntry from './SfSearchEntry';

import styles from './SfSearchList.module.css';

export default class SfSearchList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={styles.searchList}>
                <div>
                    {d.sdata.records.map((value, index)=>(
                        <SfSearchEntry
                            keyprop={`basesearch-${value['Id']}`}
                            clickHandler={()=>sf.baseSearchSelected(this.props.stateSetter, value['Id'])}
                        >
                            {d.sdata.layout.map((val,ind) => (
                                <p 
                                    key={`searchentry-index-${ind}`}
                                >
                                    {mf.parseLayout(val, d.sdata.records[index])}
                                </p>
                            ))}
                        </SfSearchEntry>
                    ))}
                </div>
            </div>
        );
    }
}