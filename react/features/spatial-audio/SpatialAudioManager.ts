import { 
    IPanningStrategy, 
    ILayoutStrategy, 
    ISpatialPosition, 
    ISpatialAudioSettings, 
    IParticipantAudioData, 
    SpatialAudioType,
    SpatialAudioEventType,
    SpatialAudioEventHandler,
    ISpatialAudioEvents
} from './types';

import { HRTFPanningStrategy } from './strategies/HRTFPanningStrategy';
import { StereoPanningStrategy } from './strategies/StereoPanningStrategy';
import { EqualpowerPanningStrategy } from './strategies/EqualpowerPanningStrategy';
import { NonePanningStrategy } from './strategies/NonePanningStrategy';
import { FixedAzimuthLayoutStrategy } from './layouts/FixedAzimuthLayoutStrategy';
import { DEFAULT_SPATIAL_AUDIO_SETTINGS } from './constants';


export class SpatialAudioManager {
    private static instance: SpatialAudioManager | null = null;
    
    private audioContext: AudioContext;
    private currentStrategy: IPanningStrategy;
    private layoutStrategy: ILayoutStrategy;
    private participants = new Map<string, IParticipantAudioData>();
    private settings: ISpatialAudioSettings;
    private eventListeners = new Map<SpatialAudioEventType, Set<SpatialAudioEventHandler<any>>>();
    
    private constructor() {
        this.audioContext = this.createAudioContext();
        
        this.settings = { ...DEFAULT_SPATIAL_AUDIO_SETTINGS };
        
        this.layoutStrategy = new FixedAzimuthLayoutStrategy();
        this.currentStrategy = new NonePanningStrategy(this.audioContext);
        
        console.log('SpatialAudioManager: Initialized with default settings');
    }
    
    static getInstance(): SpatialAudioManager {
        if (!SpatialAudioManager.instance) {
            SpatialAudioManager.instance = new SpatialAudioManager();
        }
        return SpatialAudioManager.instance;
    }
    
    private createAudioContext(): AudioContext {
        if ((window as any).context) {
            console.log('SpatialAudioManager: Using existing global AudioContext');
            return (window as any).context;
        }
        
        const context = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        (window as any).context = context; 
        console.log('SpatialAudioManager: Created new AudioContext');
        return context;
    }
    
    addEventListener<T extends SpatialAudioEventType>(
        eventType: T, 
        handler: SpatialAudioEventHandler<T>
    ): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, new Set());
        }
        this.eventListeners.get(eventType)!.add(handler);
    }
    
    removeEventListener<T extends SpatialAudioEventType>(
        eventType: T, 
        handler: SpatialAudioEventHandler<T>
    ): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.delete(handler);
        }
    }
    
    private emit<T extends SpatialAudioEventType>(
        eventType: T, 
        data: ISpatialAudioEvents[T]
    ): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`SpatialAudioManager: Error in event handler for ${eventType}:`, error);
                }
            });
        }
    }
    
    synchronizeWithAllParticipants(allParticipantIds: string[]): void {
        console.log(`SpatialAudioManager: Synchronizing with ${allParticipantIds.length} participants:`, allParticipantIds);
        
        const existingParticipantsWithSources = new Map<string, AudioNode>();
        const existingParticipantsData = new Map<string, IParticipantAudioData>();
        
        this.participants.forEach((participant, id) => {
            existingParticipantsData.set(id, participant);
            if (participant.source) {
                existingParticipantsWithSources.set(id, participant.source);
            }
        });
        
        this.participants.clear();
        
        allParticipantIds.forEach((participantId, index) => {
            const existingData = existingParticipantsData.get(participantId);
            const existingSource = existingParticipantsWithSources.get(participantId);
            
            const participantData: IParticipantAudioData = {
                participantId,
                displayName: existingData?.displayName || `Participant ${index + 1}`,
                isLocal: existingData?.isLocal || false,
                isMuted: existingData?.isMuted || !existingSource, 
                trackIndex: index, 
                position: { x: 0, y: 0, z: 0 }, 
                source: existingSource 
            };
            
            this.participants.set(participantId, participantData);
        });
        
        this.recalculateAllPositions();
        
        if (this.settings.enabled) {
            existingParticipantsWithSources.forEach((source, participantId) => {
                if (this.participants.has(participantId)) {
                    this.currentStrategy.createNodes(participantId, this.settings);
                    this.currentStrategy.connectSource(participantId, source);
                    
                    const participant = this.participants.get(participantId);
                    if (participant) {
                        this.currentStrategy.updatePosition(participantId, participant.position);
                    }
                }
            });
        }
        
        console.log(`SpatialAudioManager: Synchronized with ${allParticipantIds.length} participants`);
    }

    addParticipant(participantData: Omit<IParticipantAudioData, 'position'>): void {
        const participantId = participantData.participantId;
        
        let existingParticipant = this.participants.get(participantId);
        
        if (existingParticipant) {
            existingParticipant.displayName = participantData.displayName;
            existingParticipant.isMuted = participantData.isMuted;
            existingParticipant.source = participantData.source;
            
            console.log(`SpatialAudioManager: Updated existing participant ${participantId} with audio data`);
        } else {
            const position = this.calculateParticipantPosition(participantData.trackIndex);
            
            const fullData: IParticipantAudioData = {
                ...participantData,
                position
            };
            
            this.participants.set(participantId, fullData);
            
            this.recalculateAllPositions();
            
            console.log(`SpatialAudioManager: Added new participant ${participantId} at position`, position);
        }
        
        if (this.settings.enabled) {
            this.currentStrategy.createNodes(participantId, this.settings);
            
            const participant = this.participants.get(participantId);
            if (participant?.source) {
                this.currentStrategy.connectSource(participantId, participant.source);
            }
            
            if (participant) {
                this.currentStrategy.updatePosition(participantId, participant.position);
            }
        }
        
        const participant = this.participants.get(participantId);
        if (participant) {
            this.emit('participantAdded', { participantId, position: participant.position });
        }
    }
    

    removeParticipant(participantId: string): void {
        const participant = this.participants.get(participantId);
        if (!participant) {
            console.warn(`SpatialAudioManager: Participant ${participantId} not found for removal`);
            return;
        }
        
        if (this.settings.enabled) {
            this.currentStrategy.disconnectParticipant(participantId);
        }
        
        this.participants.delete(participantId);
        
        console.log(`SpatialAudioManager: Removed participant ${participantId}`);
        
        this.emit('participantRemoved', { participantId });
        
        this.recalculateAllPositions();
    }
    
    connectParticipantSource(participantId: string, source: AudioNode): void {
        const participant = this.participants.get(participantId);
        if (!participant) {
            console.warn(`Spatial: Participant ${participantId} not found for source connection`);
            return;
        }
        
        console.log(`Spatial: Connecting source for ${participantId} - AudioContext state: ${this.audioContext.state}`);
        
        if (this.audioContext.state === 'suspended') {
            console.log(`Spatial: AudioContext is suspended, attempting to resume...`);
            this.audioContext.resume().then(() => {
                console.log(`Spatial: AudioContext resumed successfully`);
            }).catch(err => {
                console.error(`Spatial: Failed to resume AudioContext:`, err);
            });
        }
        
        participant.source = source;
        
        if (this.settings.enabled) {
            console.log(`Spatial: Connecting to strategy ${this.currentStrategy.type} for participant ${participantId}`);
            this.currentStrategy.connectSource(participantId, source);
        } else {
            console.log(`Spatial: Not connecting to strategy - spatial audio disabled for participant ${participantId}`);
        }
        
        console.log(`Spatial: Source connection complete for participant ${participantId}`);
    }
    
    updateParticipantMuteStatus(participantId: string, isMuted: boolean): void {
        const participant = this.participants.get(participantId);
        if (participant) {
            participant.isMuted = isMuted;
            console.log(`SpatialAudioManager: Updated mute status for ${participantId}: ${isMuted}`);
        }
    }
    
    private calculateParticipantPosition(trackIndex: number): ISpatialPosition {
        const participantCount = this.participants.size + 1; 
        return this.layoutStrategy.getPositionForIndex(trackIndex, participantCount);
    }
    
    private recalculateAllPositions(): void {
        const participantArray = Array.from(this.participants.values());
        const positions = this.layoutStrategy.calculatePositions(participantArray.length);
        
        participantArray.forEach((participant, index) => {
            const newPosition = positions[index];
            participant.position = newPosition;
            
            if (this.settings.enabled) {
                this.currentStrategy.updatePosition(participant.participantId, newPosition);
            }
            
            this.emit('participantMoved', { 
                participantId: participant.participantId, 
                position: newPosition 
            });
        });
        
        console.log(`SpatialAudioManager: Recalculated positions for ${participantArray.length} participants`);
    }
    

    switchStrategy(newType: SpatialAudioType): void {
        if (newType === this.currentStrategy.type) {
            console.log(`SpatialAudioManager: Already using ${newType} strategy`);
            return;
        }

        const oldType = this.currentStrategy.type;

        if (this.settings.enabled) {
            this.participants.forEach((participant, participantId) => {
                if (participant.source) {
                    console.log(`SpatialAudioManager: Disconnecting source for ${participantId} before strategy switch`);
                    participant.source.disconnect();
                }
            });
        }

        this.currentStrategy.destroy();
        
        switch (newType) {
            case 'hrtf':
                this.currentStrategy = new HRTFPanningStrategy(this.audioContext);
                break;
            case 'stereo':
                this.currentStrategy = new StereoPanningStrategy(this.audioContext);
                break;
            case 'equalpower':
                this.currentStrategy = new EqualpowerPanningStrategy(this.audioContext);
                break;
            case 'none':
            default:
                this.currentStrategy = new NonePanningStrategy(this.audioContext);
                break;
        }
        
        this.settings.type = newType;
        
        if (this.settings.enabled) {
            this.participants.forEach((participant, participantId) => {
                this.currentStrategy.createNodes(participantId, this.settings);
                
                if (participant.source) {
                    this.currentStrategy.connectSource(participantId, participant.source);
                }
                
                this.currentStrategy.updatePosition(participantId, participant.position);
            });
            
            this.currentStrategy.updateGlobalSettings?.(this.settings);
        }
        
        console.log(`SpatialAudioManager: Switched from ${oldType} to ${newType} strategy`);
        
        this.emit('strategyChanged', { oldType, newType });
    }
    
    setEnabled(enabled: boolean): void {
        if (enabled === this.settings.enabled) {
            return;
        }
        
        this.settings.enabled = enabled;
        
        if (enabled) {
            this.participants.forEach((participant, participantId) => {
                this.currentStrategy.createNodes(participantId, this.settings);
                
                if (participant.source) {
                    this.currentStrategy.connectSource(participantId, participant.source);
                }
                
                this.currentStrategy.updatePosition(participantId, participant.position);
            });
            
            this.currentStrategy.updateGlobalSettings?.(this.settings);
            console.log('SpatialAudioManager: Spatial audio enabled');
        } else {
            this.participants.forEach((participant, participantId) => {
                this.currentStrategy.disconnectParticipant(participantId);
            });
            console.log('SpatialAudioManager: Spatial audio disabled');
        }
        
        this.emit('settingsUpdated', { settings: { ...this.settings } });
    }
    
    updateSettings(newSettings: Partial<ISpatialAudioSettings>): void {
        const oldSettings = { ...this.settings };
        
        console.log(`SpatialAudioManager: Updating settings from`, oldSettings, `to`, newSettings);
        
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.type && newSettings.type !== oldSettings.type) {
            console.log(`SpatialAudioManager: Strategy change requested: ${oldSettings.type} -> ${newSettings.type}`);
            this.switchStrategy(newSettings.type);
        }
        
        if (typeof newSettings.enabled === 'boolean' && newSettings.enabled !== oldSettings.enabled) {
            console.log(`SpatialAudioManager: Enable state change requested: ${oldSettings.enabled} -> ${newSettings.enabled}`);
            this.setEnabled(newSettings.enabled);
        }
        
        if (this.settings.enabled && this.currentStrategy.updateGlobalSettings) {
            this.currentStrategy.updateGlobalSettings(this.settings);
        }
        
        console.log('SpatialAudioManager: Settings updated', this.settings);
        console.log(`SpatialAudioManager: Current strategy type: ${this.currentStrategy.type}`);
        
        this.emit('settingsUpdated', { settings: { ...this.settings } });
    }
    
    getSettings(): ISpatialAudioSettings {
        return { ...this.settings };
    }
    
    getParticipant(participantId: string): IParticipantAudioData | undefined {
        return this.participants.get(participantId);
    }
    
    getAllParticipants(): IParticipantAudioData[] {
        return Array.from(this.participants.values());
    }
    
    getAudioContext(): AudioContext {
        return this.audioContext;
    }
    
    destroy(): void {
        this.currentStrategy.destroy();
        
        this.participants.clear();
        
        this.eventListeners.clear();
        
        if (this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        SpatialAudioManager.instance = null;
        
        console.log('SpatialAudioManager: Destroyed');
    }
}


export const getSpatialAudioManager = () => SpatialAudioManager.getInstance(); 