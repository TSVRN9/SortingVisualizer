import React from 'react';

export interface PlaybackProps extends PlaybackControlProps {
    progress: number;
    maxProgress: number;
}

export enum PlaybackButtonType {
    PREVIOUS = '<',
    REWIND = '⏴︎',
    PAUSE = '⏹︎',
    PLAY = '⏵︎',
    NEXT = '>',
}

export default class Playback extends React.Component<PlaybackProps> {
    constructor(props: PlaybackProps) {
        super(props);
    }

    render() {
        return (
            <div className="Playback centered-vertical">
                <PlaybackControls
                    onChange={this.props.onChange}
                    disabledButton={this.props.disabledButton}
                ></PlaybackControls>
                <div className="Playback-Progress centered-horizontal">
                    <p>
                        <b>{this.props.progress + 1}</b>
                    </p>
                    <p>/</p>
                    <p>{this.props.maxProgress}</p>
                </div>
            </div>
        );
    }
}

export interface PlaybackControlProps {
    onChange: (type: PlaybackButtonType) => void;
    disabledButton?: PlaybackButtonType;
}

function PlaybackControls(props: PlaybackControlProps) {
    return (
        <div className="Playback-Controls centered-horizontal">
            {Object.keys(PlaybackButtonType).map((key, index) => {
                return (
                    <PlaybackButton
                        onChange={props.onChange}
                        type={key as PlaybackButtonType}
                        disabled={props.disabledButton === key}
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
