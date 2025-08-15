import StateListenerRegistry from '../base/redux/StateListenerRegistry';
import { getSpatialAudioManager } from './index';


StateListenerRegistry.register(
    /* selector */ state => ({
        remoteParticipants: state['features/filmstrip'].remoteParticipants,
        spatialAudioEnabled: true
    }),
    ({ remoteParticipants }) => {
        if (remoteParticipants && remoteParticipants.length > 0) {
            console.log(`Spatial Audio Subscriber: Detected ${remoteParticipants.length} participants in filmstrip:`, remoteParticipants);
            
            try {
                const spatialAudioManager = getSpatialAudioManager();
                spatialAudioManager.synchronizeWithAllParticipants(remoteParticipants);
            } catch (error) {
                console.error('Spatial Audio Subscriber: Error synchronizing participants:', error);
            }
        } else {
            console.log('Spatial Audio Subscriber: No remote participants to synchronize');
        }
    },
    {
        deepEquals: true
    }
); 