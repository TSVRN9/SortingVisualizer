import React from 'react';
import { ArraySnapshot, Highlighting } from '../sorting/VisualArray';

interface VisualizerProps {
    height: number;
    width: number;
    snapshot: ArraySnapshot;
}

export default class Visualizer extends React.Component<VisualizerProps> {
    // for unmounting!!
    private running: boolean = true;

    constructor(props: VisualizerProps) {
        super(props);

        this.renderNumber = this.renderNumber.bind(this);
    }

    componentWillUnmount() {
        this.running = false;
    }

    render() {
        return (
            <div
                className="Visualizer centered-horizontal"
                style={{
                    margin: 0,
                }}
            >
                {this.props.snapshot.array.map(this.renderNumber)}
            </div>
        );
    }

    renderNumber(value: number, index: number): JSX.Element {
        if (!this.running) return <div />;
        return (
            <div
                className="Visualizer-number inline"
                style={{
                    height:
                        (this.props.height * value) /
                        this.props.snapshot.array.length,
                    width: this.props.width / this.props.snapshot.array.length,
                    backgroundColor:
                        this.props.snapshot.highlighting.get(index)?.type ??
                        Highlighting.DEFAULT,
                    padding: 0,
                }}
                key={index}
            />
        );
    }
}
