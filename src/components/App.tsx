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

        this.worker = new Worker(new URL('../worker.ts', import.meta.url));
        this.promptWorker([...snapshot.array]);
    }

    render() {
        // if algorithm is running
        if (this.state.snapshots.length == 0) {
            return (
                <div className="App centered-vertical">
                    <h1>Loading...</h1>
                </div>
            );
        } else {
            return (
                <div className="App centered-vertical">
                    <Selector
                        name={this.getCurrentAlgorithmName()}
                        info={this.getCurrentAlgorithmInfo()}
                        onChange={this.selectorHandler}
                    ></Selector>
                    <Visualizer
                        snapshot={this.getCurrentSnapshot()}
                        height={window.innerHeight * 0.6}
                        width={Math.min(window.innerWidth, 700)}
                    />
                    <Playback
                        onChange={this.playbackHandler}
                        progress={this.state.currentSnapshot}
                        maxProgress={this.state.snapshots.length}
                    />
                </div>
            );
        }
    }

    // loop through states and reset array
    selectorHandler = (change: -1 | 1) => {
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
        }, this.runAlgorithm);
    };

    // rip 6 mb of memory
    snapshotHandler = (event: MessageEvent<any>) => {
        this.setState((prevState) => ({
            snapshots: prevState.snapshots.concat(event.data),
        }));
    };

    startPlayback = (change: 1 | -1) => {
        if (this.playbackTimer != undefined) {
            this.stopPlayback();
        }

        const changeFrame =
            change == 1 ? this.incrementFrame : this.decrementFrame;

        const loop = () => {
            this.playbackTimer = setTimeout(() => {
                if (!changeFrame()) {
                    this.stopPlayback();
                } else {
                    loop();
                }
            }, this.state.delay);
        };

        loop();
    };

    stopPlayback = () => {
        // typescript moment
        clearTimeout(this.playbackTimer as any);
        this.playbackTimer = undefined;
    };

    runAlgorithm = () => {
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
                this.worker = new Worker(
                    new URL('../worker.ts', import.meta.url)
                );
                this.promptWorker([...randomSnapshot.array]);
            }
        );
    };

    promptWorker = (array: number[]) => {
        this.worker.onmessage = this.snapshotHandler;

        const data = {
            name: this.getCurrentAlgorithmName(),
            array: array,
        };

        this.worker.postMessage(data);
    };

    // stop and start timers
    playbackHandler = (type: PlaybackButtonType) => {
        switch (type as string) {
            case 'PLAY':
                this.startPlayback(1);
                break;
            case 'REWIND':
                this.startPlayback(-1);
                break;
            case 'PAUSE':
                this.stopPlayback();
                break;
            case 'NEXT':
                this.incrementFrame();
                break;
            case 'PREVIOUS':
                this.decrementFrame();
                break;
        }
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
            this.runAlgorithm
        );
    };

    /**
     * Safely change frames
     * @param change - increment or decrement
     * @returns whether or not currentSnapshot was changed
     */
    incrementFrame = (): boolean => {
        const safeToIncrement =
            this.state.currentSnapshot + 1 < this.state.snapshots.length;

        if (safeToIncrement) {
            this.setState((prevState) => ({
                currentSnapshot: prevState.currentSnapshot + 1,
            }));
        }

        return safeToIncrement;
    };

    decrementFrame = (): boolean => {
        const safeToDecrement = this.state.currentSnapshot - 1 >= 0;

        if (safeToDecrement) {
            this.setState((prevState) => ({
                currentSnapshot: prevState.currentSnapshot - 1,
            }));
        }

        return safeToDecrement;
    };
}
