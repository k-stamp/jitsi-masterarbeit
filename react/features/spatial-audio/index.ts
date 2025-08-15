export { SpatialAudioManager, getSpatialAudioManager } from './SpatialAudioManager';

export type {
    SpatialAudioType,
    ISpatialPosition,
    IParticipantAudioData,
    IPanningStrategy,
    ILayoutStrategy,
    ISpatialAudioSettings,
    ISpatialAudioEvents,
    SpatialAudioEventType,
    SpatialAudioEventHandler
} from './types';

export { HRTFPanningStrategy } from './strategies/HRTFPanningStrategy';
export { StereoPanningStrategy } from './strategies/StereoPanningStrategy';
export { EqualpowerPanningStrategy } from './strategies/EqualpowerPanningStrategy';
export { NonePanningStrategy } from './strategies/NonePanningStrategy';

export { GridLayoutStrategy } from './layouts/GridLayoutStrategy';

export * from './actions';
export { default as spatialAudioReducers } from './reducer';

export { default as SpatialAudioControls } from './components/SpatialAudioControls';

export { SpatialAudioDebug } from './debug';

import './subscriber'; 