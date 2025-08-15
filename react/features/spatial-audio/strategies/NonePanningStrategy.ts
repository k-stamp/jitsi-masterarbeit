import { IPanningStrategy, ISpatialPosition, ISpatialAudioSettings, SpatialAudioType } from '../types';

export class NonePanningStrategy implements IPanningStrategy {
    readonly type: SpatialAudioType = 'none';
    
    private gainNodes = new Map<string, GainNode>();
    private audioContext: AudioContext;
    
    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
    }
    
    createNodes(participantId: string, settings: ISpatialAudioSettings): AudioNode[] {
        const gain = this.audioContext.createGain();
        
        gain.gain.value = settings.masterVolume;
        
        gain.connect(this.audioContext.destination);
        
        this.gainNodes.set(participantId, gain);
        
        console.log(`SpatialAudio: Created mono (none) nodes for participant ${participantId} with gain ${gain.gain.value}`);
        
        return [gain];
    }
    
    updatePosition(participantId: string, position: ISpatialPosition): void {
        console.log(`SpatialAudio: Position update ignored for mono audio (participant ${participantId})`);
    }
    
    connectSource(participantId: string, source: AudioNode): void {
        const gain = this.gainNodes.get(participantId);
        if (!gain) {
            console.warn(`SpatialAudio: No gain node found for participant ${participantId}`);
            return;
        }
        
        source.connect(gain);
        console.log(`SpatialAudio: Connected source for participant ${participantId} to mono gain`);
    }
    
    disconnectParticipant(participantId: string): void {
        const gain = this.gainNodes.get(participantId);
        
        if (gain) {
            gain.disconnect();
        }
        
        console.log(`SpatialAudio: Disconnected mono nodes for participant ${participantId}`);
    }
    
    getOutputNode(participantId: string): AudioNode | null {
        return this.gainNodes.get(participantId) || null;
    }
    
    updateGlobalSettings(settings: ISpatialAudioSettings): void {
        this.gainNodes.forEach((gainNode, participantId) => {
            gainNode.gain.value = settings.masterVolume;
        });
        
        console.log('SpatialAudio: Updated mono global settings');
    }
    
    destroy(): void {
        this.gainNodes.forEach((gain, participantId) => {
            this.disconnectParticipant(participantId);
        });
        
        this.gainNodes.clear();
        
        console.log('SpatialAudio: Mono strategy destroyed');
    }
} 