import { ReducersMapObject } from 'redux';
import { 
    SPATIAL_AUDIO_ENABLE, 
    SPATIAL_AUDIO_DISABLE, 
    SPATIAL_AUDIO_SET_TYPE, 
    SPATIAL_AUDIO_UPDATE_SETTINGS 
} from './actions';
import { SpatialAudioType, ISpatialAudioSettings } from './types';
import { DEFAULT_SPATIAL_AUDIO_SETTINGS } from './constants';

const initialState: ISpatialAudioSettings = DEFAULT_SPATIAL_AUDIO_SETTINGS;

export function spatialAudio(state = initialState, action: any): ISpatialAudioSettings {
    switch (action.type) {
        case SPATIAL_AUDIO_ENABLE:
            return {
                ...state,
                enabled: true
            };
            
        case SPATIAL_AUDIO_DISABLE:
            return {
                ...state,
                enabled: false
            };
            
        case SPATIAL_AUDIO_SET_TYPE:
            return {
                ...state,
                type: action.audioType
            };
            
        case SPATIAL_AUDIO_UPDATE_SETTINGS:
            return {
                ...state,
                ...action.settings
            };
            
        default:
            return state;
    }
}


const spatialAudioReducers: ReducersMapObject = {
    spatialAudio
};

export default spatialAudioReducers; 