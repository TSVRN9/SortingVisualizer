import * as React from "react";
import { ComparisonResult, DrawnArray, HighlightedIndex, VisualArray } from "../sorting/arrays/visualarray";
import { generateArray, generateShuffledArray } from "../sorting/util";

class SortingVisualizer extends React.Component {
    render() {
        return (
            <div className="sorting-visualizer">
                <AlgorithmInfo />
                <ReactVisualArray />
            </div>
        );
    }
}

class AlgorithmInfo extends React.Component {
    render() {
        return <div className="algorithm-information"></div>;
    }
}

class ReactVisualArray extends React.Component {
    constructor(props: { array: VisualArray }) {
        super(props);
    }

    render() {
        return <div className="visual-array">{
            (this.props as Readonly<{ array: VisualArray }>).array.
        }</div>;
    }
}
