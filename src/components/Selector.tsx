import React from 'react';
import { AlgorithmInfo } from '../sorting/AlgorithmList';

interface SelectorProps {
    onUpdate: (newAlgorithm: number) => void;
}

interface SelectorState {
    currentAlgorithm: number;
}

export default class Selector extends React.Component<SelectorProps, SelectorState> {
    constructor(props: SelectorProps) {
        super(props);

        this.state = {
            currentAlgorithm: 
        }
    }

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

    clickHandler(change: number) {
        const newAlgorithm = 

        this.props.onUpdate(newAlgorithm);
    }
}
