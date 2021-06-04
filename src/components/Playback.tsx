import React from 'react';

export interface PlaybackProps {
    // The main app can just update its state from the updated progress bar
    onUpdate: (newProgress: number) => void;
    progress: number;
    maxProgress: number;
}

export interface PlaybackState {
    disabledButtons: PlaybackButtonType[];
}

export default class Playback extends React.Component<PlaybackProps, PlaybackState> {
    constructor(props: PlaybackProps) {
        super(props);
    }

    render() {
        return (
            <div className="Playback centered-vertical">
                <PlaybackControls
                    clickHandler={this.clickHandler}
                    disabledButtons={this.state.disabledButtons}
                ></PlaybackControls>
                <div className="Playback-Progress centered-horizontal">
                    <p>
                        <b>{this.props.progress}</b>
                    </p>
                    <p>/</p>
                    <p>{this.props.maxProgress}</p>
                </div>
            </div>
        );
    }

    clickHandler = () => {

    }
}

export interface PlaybackControlProps {
    clickHandler: (type: PlaybackButtonType) => void;
    disabledButtons?: PlaybackButtonType[];
}

function PlaybackControls(props: PlaybackControlProps) {
    return (
        <div className="Playback-Controls centered-horizontal">
            {Object.keys(PlaybackButtonType).map((key, index) => {
                return (
                    <PlaybackButton
                        onChange={props.clickHandler}
                        type={key as PlaybackButtonType}
                        disabled={props.disabledButtons?.includes(key as PlaybackButtonType)}
                        key={index}
                    />
                );
            })}
        </div>
    );
}

function PlaybackButton(props: {
    onChange: (type: PlaybackButtonType) => void;
    type: PlaybackButtonType;
    disabled?: boolean;
}) {
    // enums are implicit objects
    const display = (PlaybackButtonType as any)[props.type];

    return (
        <button
            className="Playback-Button"
            disabled={props.disabled}
            onClick={() => props.onChange(props.type)}
        >
            {display}
        </button>
    );
}

export enum PlaybackButtonType {
    FIRST = '⏮',
    PREVIOUS = '<',
    REWIND = '◀',
    PAUSE = '⏹',
    PLAY = '▶',
    NEXT = '>',
    LAST = '⏭'
}
