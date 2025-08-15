import { connect } from 'react-redux';

import { createToolbarEvent } from '../../../analytics/AnalyticsEvents';
import { sendAnalytics } from '../../../analytics/functions';
import { IReduxState } from '../../../app/types';
import { translate } from '../../../base/i18n/functions';
import { IconGear } from '../../../base/icons/svg';
import AbstractButton, { IProps as AbstractButtonProps } from '../../../base/toolbox/components/AbstractButton';
import { getSpatialAudioManager } from '../../../spatial-audio';
import { getParticipantCount, getRemoteParticipants } from '../../../base/participants/functions';

interface IProps extends AbstractButtonProps {
    _spatialAudioEnabled: boolean;
    _participantCount: number;
    _remoteParticipants?: Map<string, any>;
}

class SpatialAudioDebugButton extends AbstractButton<IProps> {
    accessibilityLabel = 'toolbar.accessibilityLabel.spatialAudioDebug';
    icon = IconGear;
    label = 'toolbar.spatialAudioDebug';
    tooltip = 'toolbar.spatialAudioDebug';

    _handleClick() {
        const { _spatialAudioEnabled, _participantCount, _remoteParticipants } = this.props;

        sendAnalytics(createToolbarEvent(
            'spatial.debug.button',
            {
                'spatial_audio_enabled': _spatialAudioEnabled,
                'participant_count': _participantCount
            }));

        this._outputComprehensiveDebugInfo();
    }

    _outputComprehensiveDebugInfo() {
        const { _spatialAudioEnabled, _participantCount, _remoteParticipants } = this.props;
        
        try {
            const manager = getSpatialAudioManager();
            const settings = manager.getSettings();
            const participants = manager.getAllParticipants();
            const audioContext = manager.getAudioContext();

            // Header
            console.clear();
            console.log('🔊═══════════════════════════════════════════════════════════════════════════════════════');
            console.log('🔊 JITSI SPATIAL AUDIO DEBUG REPORT');
            console.log('🔊═══════════════════════════════════════════════════════════════════════════════════════');
            console.log();

            // 1. Current Audio Mode
            console.log('🎵 AKTUELLER AUDIO-MODUS:');
            console.log(`   Modus: ${settings.enabled ? settings.type.toUpperCase() : 'DEAKTIVIERT'}`);
            console.log(`   Status: ${settings.enabled ? '✅ Aktiviert' : '❌ Deaktiviert'}`);
            console.log(`   AudioContext: ${audioContext.state}`);
            console.log(`   Master Volume: ${(settings.masterVolume * 100).toFixed(0)}%`);
            console.log();

            // 2. Participant Overview
            console.log('👥 TEILNEHMERÜBERSICHT:');
            console.log(`   Gesamt: ${_participantCount} Teilnehmer`);
            console.log(`   Remote: ${_remoteParticipants?.size || 0} Teilnehmer`);
            console.log(`   Mit Audio: ${participants.length} Teilnehmer`);
            console.log();

            // 3. Visual Grid Representation
            this._renderParticipantGrid(participants);

            // 4. Detailed Participant & Audio Stream Information
            this._renderDetailedParticipantInfo(participants, _remoteParticipants);

            // 5. Technical Information
            this._renderTechnicalInfo(manager, settings);

            console.log('🔊═══════════════════════════════════════════════════════════════════════════════════════');
            console.log('🔊 DEBUG REPORT ENDE');
            console.log('🔊═══════════════════════════════════════════════════════════════════════════════════════');

        } catch (error) {
            console.error('❌ Fehler beim Generieren des Debug-Reports:', error);
        }
    }

    _renderParticipantGrid(participants: any[]) {
        console.log('🏗️ TEILNEHMER-GRID VISUALISIERUNG:');
        
        if (participants.length === 0) {
            console.log('   ⚠️ Keine Teilnehmer mit Audio-Streams gefunden');
            console.log();
            return;
        }

        const sortedParticipants = [...participants].sort((a, b) => (a.trackIndex || 0) - (b.trackIndex || 0));
        
        const count = sortedParticipants.length;
        let rows: any[][] = [];
        
        if (count <= 4) {
            rows = [sortedParticipants];
        } else if (count <= 8) {
            const participantsPerRow = Math.ceil(count / 2);
            rows = [
                sortedParticipants.slice(0, participantsPerRow),
                sortedParticipants.slice(participantsPerRow)
            ];
        } else if (count <= 12) {
            const participantsPerRow = Math.ceil(count / 3);
            rows = [
                sortedParticipants.slice(0, participantsPerRow),
                sortedParticipants.slice(participantsPerRow, participantsPerRow * 2),
                sortedParticipants.slice(participantsPerRow * 2)
            ];
        } else {
            rows = [sortedParticipants];
        }

        const maxNameLength = 12;
        const cellWidth = maxNameLength + 4;
        
        rows.forEach((row, rowIndex) => {
            let topBorder = '   ┌';
            let content = '   │';
            let coords = '   │';
            let bottomBorder = '   └';
            
            row.forEach((participant, colIndex) => {
                const name = (participant.displayName || participant.participantId || 'Unknown').substring(0, maxNameLength);
                const paddedName = name.padEnd(maxNameLength);
                const pos = participant.position || { x: 0, y: 0, z: 0 };
                const coordText = `x:${pos.x.toFixed(1)}, y:${pos.y.toFixed(1)}`.padEnd(maxNameLength);
                
                content += ` ${paddedName} `;
                coords += ` ${coordText} `;
                
                if (colIndex < row.length - 1) {
                    topBorder += '─'.repeat(cellWidth) + '┬';
                    content += '│';
                    coords += '│';
                    bottomBorder += '─'.repeat(cellWidth) + '┴';
                } else {
                    topBorder += '─'.repeat(cellWidth) + '┐';
                    content += '│';
                    coords += '│';
                    bottomBorder += '─'.repeat(cellWidth) + '┘';
                }
            });
            
            if (rowIndex === 0) console.log(topBorder);
            console.log(content);
            console.log(coords);
            console.log(bottomBorder);
            
            if (rowIndex < rows.length - 1) {
                console.log(); // Space between rows
            }
        });
        
        console.log();
    }

    _renderDetailedParticipantInfo(participants: any[], remoteParticipants?: Map<string, any>) {
        console.log('🎧 DETAILLIERTE TEILNEHMER & AUDIO-STREAM INFORMATIONEN:');
        console.log();
        
        if (participants.length === 0) {
            console.log('   ⚠️ Keine Teilnehmer mit Audio-Streams gefunden');
            console.log();
            return;
        }

        participants.forEach((participant, index) => {
            const remoteParticipant = remoteParticipants?.get(participant.participantId);
            const pos = participant.position || { x: 0, y: 0, z: 0 };
            
            console.log(`${String.fromCharCode(65 + index)}. ${participant.displayName || participant.participantId || 'Unknown'}`);
            console.log(`   └─ Teilnehmer-ID: ${participant.participantId}`);
            console.log(`   └─ Track Index: ${participant.trackIndex || 'N/A'}`);
            console.log(`   └─ Audio Status: ${participant.isMuted ? '🔇 Stumm' : '🔊 Aktiv'}`);
            console.log(`   └─ Stream Source: ${participant.source ? '✅ Verfügbar' : '❌ Nicht verfügbar'}`);
            console.log(`   └─ Position: (x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z?.toFixed(2) || '0.00'})`);
            
            if (remoteParticipant) {
                console.log(`   └─ Verbindung: ${remoteParticipant.connectionStatus || 'Unbekannt'}`);
                console.log(`   └─ Features: ${remoteParticipant.features ? Object.keys(remoteParticipant.features).join(', ') || 'Keine' : 'Keine'}`);
            }
            
            // Audio element information
            const audioElement = document.querySelector(`audio[id*="${participant.participantId}"]`) as HTMLAudioElement;
            if (audioElement) {
                console.log(`   └─ Audio Element: Volume ${(audioElement.volume * 100).toFixed(0)}%, ${audioElement.muted ? 'Stumm' : 'Aktiv'}, ${audioElement.paused ? 'Pausiert' : 'Läuft'}`);
            } else {
                console.log(`   └─ Audio Element: ❌ Nicht gefunden`);
            }
            
            console.log();
        });
    }

    _renderTechnicalInfo(manager: any, settings: any) {
        console.log('⚙️ TECHNISCHE INFORMATIONEN:');
        console.log();
        
        const strategy = (manager as any).currentStrategy;
        if (strategy) {
            console.log(`🎛️ Aktuelle Strategie: ${strategy.type.toUpperCase()}`);
            
            if (strategy.type === 'hrtf' || strategy.type === 'equalpower') {
                console.log(`   └─ Panning Model: ${strategy.type === 'hrtf' ? 'HRTF' : 'Equal Power'}`);
                console.log(`   └─ Distance Model: Inverse`);
                console.log(`   └─ Reference Distance: 1`);
                console.log(`   └─ Max Distance: 10000`);
            } else if (strategy.type === 'stereo') {
                console.log(`   └─ Pan Range: -1.0 (Links) bis +1.0 (Rechts)`);
            }
        }
        
        console.log();
        console.log('👂 Listener Konfiguration:');
        console.log(`   └─ Position: (x: ${settings.listenerPosition.x}, y: ${settings.listenerPosition.y}, z: ${settings.listenerPosition.z})`);
        if (settings.listenerOrientation) {
            console.log(`   └─ Orientierung Forward: (x: ${settings.listenerOrientation.forward.x}, y: ${settings.listenerOrientation.forward.y}, z: ${settings.listenerOrientation.forward.z})`);
            console.log(`   └─ Orientierung Up: (x: ${settings.listenerOrientation.up.x}, y: ${settings.listenerOrientation.up.y}, z: ${settings.listenerOrientation.up.z})`);
        }
        
        console.log();
        console.log('🎵 AudioContext Details:');
        const audioContext = manager.getAudioContext();
        console.log(`   └─ State: ${audioContext.state}`);
        console.log(`   └─ Sample Rate: ${audioContext.sampleRate} Hz`);
        console.log(`   └─ Base Latency: ${audioContext.baseLatency?.toFixed(4) || 'N/A'} s`);
        console.log(`   └─ Output Latency: ${audioContext.outputLatency?.toFixed(4) || 'N/A'} s`);
        
        console.log();
    }

    _isDisabled() {
        return !this.props._spatialAudioEnabled;
    }
}


function mapStateToProps(state: IReduxState) {
    return {
        _spatialAudioEnabled: (window as any).spatialAudio || false,
        _participantCount: getParticipantCount(state),
        _remoteParticipants: getRemoteParticipants(state)
    };
}

export default translate(connect(mapStateToProps)(SpatialAudioDebugButton));