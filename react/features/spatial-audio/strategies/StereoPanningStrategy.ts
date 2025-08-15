import { IPanningStrategy, ISpatialPosition, ISpatialAudioSettings, SpatialAudioType } from '../types';


export class StereoPanningStrategy implements IPanningStrategy {
    readonly type: SpatialAudioType = 'stereo';
    
    private pannerNodes = new Map<string, StereoPannerNode>();
    private gainNodes = new Map<string, GainNode>();
    private audioContext: AudioContext;
    
    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
    }
    
    createNodes(participantId: string, settings: ISpatialAudioSettings): AudioNode[] {
        const panner = this.audioContext.createStereoPanner();
        const gain = this.audioContext.createGain();
        
        gain.gain.value = settings.masterVolume;
        
        panner.connect(gain);
        
        gain.connect(this.audioContext.destination);
        
        this.pannerNodes.set(participantId, panner);
        this.gainNodes.set(participantId, gain);
        
        console.log(`SpatialAudio: Created stereo nodes for participant ${participantId} with gain ${gain.gain.value}`);
        
        return [panner, gain];
    }
    
    updatePosition(participantId: string, position: ISpatialPosition): void {
        const panner = this.pannerNodes.get(participantId);
        if (!panner) {
            console.warn(`SpatialAudio: No stereo panner found for participant ${participantId}`);
            return;
        }
        
        const panValue = Math.max(-1, Math.min(1, position.x / 2));
        panner.pan.value = panValue;
        
        console.log(`SpatialAudio: Updated stereo position for ${participantId} to pan=${panValue} (from x=${position.x})`);
    }
    
    connectSource(participantId: string, source: AudioNode): void {
        const panner = this.pannerNodes.get(participantId);
        if (!panner) {
            console.warn(`Spatial: No stereo panner found for participant ${participantId}`);
            return;
        }
        
        console.log(`Spatial: Connecting source for ${participantId} - source constructor: ${source.constructor.name}`);
        console.log(`Spatial: Panner details - pan value: ${panner.pan.value}, context state: ${panner.context.state}`);
        
        try {
            source.disconnect();
            console.log(`Spatial: Disconnected source for ${participantId} before reconnecting`);
        } catch (e) {
            console.log(`Spatial: Source was not connected before for ${participantId} (this is normal)`);
        }
        
        source.connect(panner);
        console.log(`Spatial: Successfully connected source for participant ${participantId} to stereo panner`);
        
        const gain = this.gainNodes.get(participantId);
        if (gain) {
            console.log(`Spatial: Audio path for ${participantId}: source -> panner (pan=${panner.pan.value}) -> gain (volume=${gain.gain.value}) -> destination`);
        }
    }
    
    disconnectParticipant(participantId: string): void {
        const panner = this.pannerNodes.get(participantId);
        const gain = this.gainNodes.get(participantId);
        
        if (panner) {
            panner.disconnect();
        }
        if (gain) {
            gain.disconnect();
        }
        
        console.log(`SpatialAudio: Disconnected stereo nodes for participant ${participantId}`);
    }
    
    getOutputNode(participantId: string): AudioNode | null {
        return this.gainNodes.get(participantId) || null;
    }
    
    updateGlobalSettings(settings: ISpatialAudioSettings): void {
        this.gainNodes.forEach((gainNode, participantId) => {
            gainNode.gain.value = settings.masterVolume;
        });
        
        console.log('SpatialAudio: Updated stereo global settings');
    }
    
    destroy(): void {
        this.pannerNodes.forEach((panner, participantId) => {
            this.disconnectParticipant(participantId);
        });
        
        this.pannerNodes.clear();
        this.gainNodes.clear();
        
        console.log('SpatialAudio: Stereo strategy destroyed');
    }
} 