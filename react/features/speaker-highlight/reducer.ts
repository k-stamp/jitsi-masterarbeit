import ReducerRegistry from '../base/redux/ReducerRegistry';

import { SET_SPEAKER_HIGHLIGHT_ENABLED, TOGGLE_SPEAKER_HIGHLIGHT } from './actionTypes';


const INITIAL_STATE = {
    enabled: false
};

export interface ISpeakerHighlightState {
    enabled: boolean;
}


ReducerRegistry.register<ISpeakerHighlightState>('features/speaker-highlight', (state = INITIAL_STATE, action): ISpeakerHighlightState => {
    switch (action.type) {
    case SET_SPEAKER_HIGHLIGHT_ENABLED:
        return {
            ...state,
            enabled: action.enabled
        };

    case TOGGLE_SPEAKER_HIGHLIGHT:
        return {
            ...state,
            enabled: !state.enabled
        };

    default:
        return state;
    }
}); 