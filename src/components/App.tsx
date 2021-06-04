import React from 'react';
import { AlgorithmList, AlgorithmInfo } from '../sorting/AlgorithmList';
import { generateRandomSnapshot } from '../sorting/util';
import { ArraySnapshot } from '../sorting/VisualArray';
import Playback, { PlaybackButtonType } from './Playback';
import Selector from './Selector';
import Visualizer from './Visualizer';

const algs = new AlgorithmList();

interface AppState {
    currentAlgorithm: number;
    currentSnapshot: number;
    snapshots: ArraySnapshot[];
    arraySize: number;
    delay: number; // in ms
}

export default class App extends React.Component<{}, AppState> {
    private worker: Worker;
    private playbackTimer?: NodeJS.Timeout;
    private algorithmTimer?: NodeJS.Timeout;

    constructor(props: {}) {
        super(props);

        const defaultArraySize = 100,
            defaultDelay = 10,
            snapshot = generateRandomSnapshot(defaultArraySize);

        this.state = {
            currentAlgorithm: 0,
            currentSnapshot: 0,
            snapshots: [snapshot],
            arraySize: defaultArraySize,
            delay: defaultDelay,
        };

        this.worker = getNewWorker();
        this.promptWorker([...snapshot.array]);
    }

    render() {
        return (
            <div className="App centered-vertical">
                <Selector
                    onUpdate={this.selectorHandler}
                ></Selector>
                <Visualizer
                    snapshot={this.getCurrentSnapshot()}
                    height={window.innerHeight * 0.6}
                    width={Math.min(window.innerWidth, 700)}
                />
                <Playback
                    onUpdate={this.playbackHandler}
                    progress={this.state.currentSnapshot + 1}
                    maxProgress={this.state.snapshots.length}
                />
            </div>
        );
    }

    // rip 6 mb of memory
    workerHandler = (event: MessageEvent<any>) => {
        this.setState((prevState) => ({
            snapshots: prevState.snapshots.concat(event.data),
        }));
    };


    selectorHandler = (newAlgorithm: ) => {
        this.setState((prevState) => {
            const newSelection = prevState.currentAlgorithm + change;

            return {
                currentAlgorithm:
                    // modulo doesnt work w/ negative numbers
                    newSelection == -1
                        ? algs.length - 1
                        : newSelection == algs.length
                        ? 0
                        : newSelection,
            };
        }, this.runNewAlgorithm);
    };

    playbackHandler = (newProgress: number) => {
        this.setState({
            currentSnapshot: newProgress
        });
    };

    runNewAlgorithm = () => {
        if (this.algorithmTimer) {
            clearTimeout(this.algorithmTimer);
        }
        this.worker.terminate();

        const randomSnapshot = generateRandomSnapshot();
        this.setState(
            {
                snapshots: [randomSnapshot],
                currentSnapshot: 0,
            },
            () => {
                this.worker = getNewWorker();
                this.promptWorker([...randomSnapshot.array]);
            }
        );
    };

    promptWorker = (array: number[]) => {
        this.worker.onmessage = this.workerHandler;

        const data = {
            name: this.getCurrentAlgorithmName(),
            array: array,
        };

        this.worker.postMessage(data);
    };

    getCurrentAlgorithmName = (): string => {
        return algs.names[this.state.currentAlgorithm];
    };

    getCurrentAlgorithmInfo = (): AlgorithmInfo => {
        return algs.list[this.getCurrentAlgorithmName()];
    };

    getCurrentSnapshot = (): ArraySnapshot => {
        return this.state.snapshots[this.state.currentSnapshot];
    };

    // don't set too high or itll block the thread
    setArraySize = (newSize: number) => {
        this.setState(
            {
                currentSnapshot: 0,
                arraySize: newSize,
            },
            this.runNewAlgorithm
        );
    };
}

function getNewWorker() {
    return new Worker(new URL('../worker.ts', import.meta.url));
}