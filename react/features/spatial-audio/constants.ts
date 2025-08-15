import { ISpatialAudioSettings } from './types';

/**
 * Default spatial audio settings - single source of truth
 * Used by both Redux reducer and SpatialAudioManager
 */
export const DEFAULT_SPATIAL_AUDIO_SETTINGS: ISpatialAudioSettings = {
    enabled: false,
    type: 'none',
    masterVolume: 0.6, // Master volume setting
    listenerPosition: { x: 0, y: 0, z: 0 },
    listenerOrientation: {
        forward: { x: 0, y: 0, z: -1 },
        up: { x: 0, y: 1, z: 0 }
    }
};