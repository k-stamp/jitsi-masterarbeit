import { IPanningStrategy, ISpatialPosition, ISpatialAudioSettings, SpatialAudioType } from '../types';


export class EqualpowerPanningStrategy implements IPanningStrategy {
    readonly type: SpatialAudioType = 'equalpower';
    
    private pannerNodes = new Map<string, PannerNode>();
    private gainNodes = new Map<string, GainNode>();
    private audioContext: AudioContext;
    private listenerInitialized = false;
    
    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
        this.initializeListener();
    }
    
    private initializeListener(): void {
        if (this.listenerInitialized || !this.audioContext.listener) {
            return;
        }
        
        const listener = this.audioContext.listener;
        
        if ('forwardX' in listener) {
            listener.forwardX.value = 0;
            listener.forwardY.value = 0;
            listener.forwardZ.value = -1;
            listener.upX.value = 0;
            listener.upY.value = 1;
            listener.upZ.value = 0;
        } else {
            (listener as any).setOrientation(0, 0, -1, 0, 1, 0);
        }
        
        if ('positionX' in listener) {
            listener.positionX.value = 0;
            listener.positionY.value = 0;
            listener.positionZ.value = 0;
        } else {
            (listener as any).setPosition(0, 0, 0);
        }
        
        this.listenerInitialized = true;
        console.log('SpatialAudio: Equalpower listener initialized');
    }
    
    createNodes(participantId: string, settings: ISpatialAudioSettings): AudioNode[] {
        const panner = this.audioContext.createPanner();
        const gain = this.audioContext.createGain();
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(settings.masterVolume, this.audioContext.currentTime + 0.1);
        
        panner.panningModel = 'equalpower';
        panner.distanceModel = 'none';
        panner.refDistance = 0.7;
        panner.maxDistance = 10000;
        panner.rolloffFactor = 0;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 360;
        panner.coneOuterGain = 1;
        
        if ('orientationX' in panner) {
            panner.orientationX.value = 0;
            panner.orientationY.value = 0;
            panner.orientationZ.value = -1;
        } else {
            (panner as any).setOrientation(0, 0, -1);
        }
        
        panner.connect(gain);
        
        gain.connect(this.audioContext.destination);
        
        this.pannerNodes.set(participantId, panner);
        this.gainNodes.set(participantId, gain);
        
        console.log(`SpatialAudio: Created equalpower nodes for participant ${participantId} with gain ${gain.gain.value}`);
        
        return [panner, gain];
    }
    
    updatePosition(participantId: string, position: ISpatialPosition): void {
        const panner = this.pannerNodes.get(participantId);
        if (!panner) {
            console.warn(`SpatialAudio: No equalpower panner found for participant ${participantId}`);
            return;
        }
        
        if ('positionX' in panner) {
            panner.positionX.value = position.x;
            panner.positionY.value = position.y;
            panner.positionZ.value = position.z || 0;
        } else {
            (panner as any).setPosition(position.x, position.y, position.z || 0);
        }
        
        console.log(`SpatialAudio: Updated equalpower position for ${participantId} to x=${position.x}, y=${position.y}, z=${position.z || 0}`);
    }
    
    connectSource(participantId: string, source: AudioNode): void {
        const panner = this.pannerNodes.get(participantId);
        if (!panner) {
            console.warn(`SpatialAudio: No equalpower panner found for participant ${participantId}`);
            return;
        }
        
        source.connect(panner);
        console.log(`SpatialAudio: Connected source for participant ${participantId} to equalpower panner`);
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
        
        console.log(`SpatialAudio: Disconnected equalpower nodes for participant ${participantId}`);
    }
    
    getOutputNode(participantId: string): AudioNode | null {
        return this.gainNodes.get(participantId) || null;
    }
    
    updateGlobalSettings(settings: ISpatialAudioSettings): void {
        const listener = this.audioContext.listener;
        if (!listener) return;
        
        if ('positionX' in listener) {
            listener.positionX.value = settings.listenerPosition.x;
            listener.positionY.value = settings.listenerPosition.y;
            listener.positionZ.value = settings.listenerPosition.z || 0;
        } else {
            (listener as any).setPosition(
                settings.listenerPosition.x,
                settings.listenerPosition.y,
                settings.listenerPosition.z || 0
            );
        }
        
        if ('forwardX' in listener) {
            listener.forwardX.value = settings.listenerOrientation.forward.x;
            listener.forwardY.value = settings.listenerOrientation.forward.y;
            listener.forwardZ.value = settings.listenerOrientation.forward.z || -1;
            listener.upX.value = settings.listenerOrientation.up.x;
            listener.upY.value = settings.listenerOrientation.up.y;
            listener.upZ.value = settings.listenerOrientation.up.z || 1;
        } else {
            (listener as any).setOrientation(
                settings.listenerOrientation.forward.x,
                settings.listenerOrientation.forward.y,
                settings.listenerOrientation.forward.z || -1,
                settings.listenerOrientation.up.x,
                settings.listenerOrientation.up.y,
                settings.listenerOrientation.up.z || 1
            );
        }
        
        this.gainNodes.forEach((gainNode, participantId) => {
            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(settings.masterVolume, this.audioContext.currentTime + 0.1);
        });
        
        console.log('SpatialAudio: Updated equalpower global settings');
    }
    
    destroy(): void {
        this.pannerNodes.forEach((panner, participantId) => {
            this.disconnectParticipant(participantId);
        });
        
        this.pannerNodes.clear();
        this.gainNodes.clear();
        
        console.log('SpatialAudio: Equalpower strategy destroyed');
    }
} 