export type SpatialAudioType = 'hrtf' | 'stereo' | 'equalpower' | 'none';

export interface ISpatialPosition {
    x: number;
    y: number;
    z?: number;
}

export interface IParticipantAudioData {
    participantId: string;
    displayName?: string;
    source?: AudioNode;
    isLocal: boolean;
    isMuted: boolean;
    position: ISpatialPosition;
    trackIndex: number;
}


export interface IPanningStrategy {
    readonly type: SpatialAudioType;
    createNodes(participantId: string, settings: ISpatialAudioSettings): AudioNode[];
    updatePosition(participantId: string, position: ISpatialPosition): void;
    connectSource(participantId: string, source: AudioNode): void;
    disconnectParticipant(participantId: string): void;
    getOutputNode(participantId: string): AudioNode | null;
    destroy(): void;
    updateGlobalSettings?(settings: ISpatialAudioSettings): void;
}

export interface ISpatialAudioSettings {
    enabled: boolean;
    type: SpatialAudioType;
    masterVolume: number;
    listenerPosition: ISpatialPosition;
    listenerOrientation: {
        forward: ISpatialPosition;
        up: ISpatialPosition;
    };
}

export interface ILayoutStrategy {
    calculatePositions(participantCount: number): ISpatialPosition[];
    getPositionForIndex(index: number, totalCount: number): ISpatialPosition;
}


export interface ISpatialAudioEvents {
    participantAdded: { participantId: string; position: ISpatialPosition };
    participantRemoved: { participantId: string };
    participantMoved: { participantId: string; position: ISpatialPosition };
    strategyChanged: { oldType: SpatialAudioType; newType: SpatialAudioType };
    settingsUpdated: { settings: ISpatialAudioSettings };
}

export type SpatialAudioEventType = keyof ISpatialAudioEvents;
export type SpatialAudioEventHandler<T extends SpatialAudioEventType> = (
    data: ISpatialAudioEvents[T]
) => void; 