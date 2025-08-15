import { SET_SPEAKER_HIGHLIGHT_ENABLED, TOGGLE_SPEAKER_HIGHLIGHT } from './actionTypes';


export function toggleSpeakerHighlight() {
    return {
        type: TOGGLE_SPEAKER_HIGHLIGHT
    };
}


export function setSpeakerHighlightEnabled(enabled: boolean) {
    return {
        type: SET_SPEAKER_HIGHLIGHT_ENABLED,
        enabled
    };
} 