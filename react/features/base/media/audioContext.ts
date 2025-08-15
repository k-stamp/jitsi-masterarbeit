import logger from './logger';

let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
    if (!audioContext) {
        try {
            audioContext = new AudioContext();
            logger.info('AudioContext erfolgreich erstellt', {
                sampleRate: audioContext.sampleRate,
                state: audioContext.state,
                baseLatency: audioContext.baseLatency
            });

            audioContext.addEventListener('statechange', () => {
                logger.debug('AudioContext State geändert:', audioContext?.state);
            });

        } catch (error) {
            logger.error('Fehler beim Erstellen des AudioContext:', error);
            throw error;
        }
    }
    
    return audioContext;
}


export function initAudioContext(): AudioContext {
    logger.info('AudioContext wird initialisiert...');
    const context = getAudioContext();
    logger.info('AudioContext Initialisierung abgeschlossen');
    return context;
}
