import ReducerRegistry from '../base/redux/ReducerRegistry';

import {
    SET_AUDIO_SETTINGS_VISIBILITY,
    SET_VIDEO_SETTINGS_VISIBILITY,
    TOGGLE_MIC_INDICATORS_VISIBILITY
} from './actionTypes';

export interface ISettingsState {
    audioSettingsVisible?: boolean;
    videoSettingsVisible?: boolean;
    micIndicatorsVisible?: boolean;
}

 ReducerRegistry.register('features/settings', (state: ISettingsState = { micIndicatorsVisible: false }, action) => {
    switch (action.type) {
    case SET_AUDIO_SETTINGS_VISIBILITY:
        return {
            ...state,
            audioSettingsVisible: action.value
        };
    case SET_VIDEO_SETTINGS_VISIBILITY:
        return {
            ...state,
            videoSettingsVisible: action.value
        };
    case TOGGLE_MIC_INDICATORS_VISIBILITY:
        return {
            ...state,
            micIndicatorsVisible: !state.micIndicatorsVisible
        };
    }

    return state;
});
