import React from 'react';
import { AlgorithmInfo } from '../sorting/AlgorithmList';

interface SelectorProps {
    name: string;
    info: AlgorithmInfo;
    onChange: (change: 1 | -1) => void;
}

export default class Selector extends React.Component<SelectorProps> {
    render() {
        return (
            <div className="Selector">
                <div className="centered-horizontal">
                    <button onClick={() => this.clickHandler(-1)}>
                        {'<<'}
                    </button>
                    <h1>{this.props.name}</h1>
                    <button onClick={() => this.clickHandler(1)}>{'>>'}</button>
                </div>
                <p>{this.props.info.description}</p>
            </div>
        );
    }

    clickHandler(change: 1 | -1) {
        this.props.onChange(change);
    }
}
