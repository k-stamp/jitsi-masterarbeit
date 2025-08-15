import { ILayoutStrategy, ISpatialPosition } from '../types';


export class FixedAzimuthLayoutStrategy implements ILayoutStrategy {
    
    private readonly fourParticipantPositions: ISpatialPosition[] = [
        { x: -0.495, y: 0.000, z: -0.495 }, // Teilnehmer A: -45°
        { x: -0.181, y: 0.000, z: -0.676 }, // Teilnehmer B: -15°
        { x:  0.181, y: 0.000, z: -0.676 }, // Teilnehmer C: +15°
        { x:  0.495, y: 0.000, z: -0.495 }  // Teilnehmer D: +45°
    ];
    
    private readonly eightParticipantPositions: ISpatialPosition[] = [
        { x: -0.495, y: 1.000, z: -0.495 }, // Teilnehmer A: -45°
        { x: -0.181, y: 1.000, z: -0.676 }, // Teilnehmer B: -15°
        { x:  0.181, y: 1.000, z: -0.676 }, // Teilnehmer C: +15°
        { x:  0.495, y: 1.000, z: -0.495 }, // Teilnehmer D: +45°
        { x: -0.495, y: -1.000, z: -0.495 }, // Teilnehmer E: -45°
        { x: -0.181, y: -1.000, z: -0.676 }, // Teilnehmer F: -15°
        { x:  0.181, y: -1.000, z: -0.676 }, // Teilnehmer G: +15°
        { x:  0.495, y: -1.000, z: -0.495 }  // Teilnehmer H: +45°
    ];
    
    calculatePositions(participantCount: number): ISpatialPosition[] {
        if (participantCount <= 4) {
            return this.fourParticipantPositions.slice(0, participantCount);
        } else if (participantCount <= 8) {
            return this.eightParticipantPositions.slice(0, participantCount);
        } else {
            console.warn(`FixedAzimuthLayoutStrategy: ${participantCount} participants not supported, using 8-participant layout`);
            return this.eightParticipantPositions;
        }
    }
    
    getPositionForIndex(index: number, totalCount: number): ISpatialPosition {
        const positions = this.calculatePositions(totalCount);
        
        if (index >= positions.length) {
            console.warn(`FixedAzimuthLayoutStrategy: Index ${index} out of range for ${totalCount} participants`);
            return positions[positions.length - 1];
        }
        
        return positions[index];
    }
    
    getAzimuthForIndex(index: number): number {
        const azimuthAngles = [-45, -15, 15, 45]; // Degrees
        return azimuthAngles[index % 4];
    }
    
    getAzimuthAngles(participantCount: number): number[] {
        const baseAngles = [-45, -15, 15, 45];
        
        if (participantCount <= 4) {
            return baseAngles.slice(0, participantCount);
        } else {
            // For 8 participants, repeat the same azimuth angles
            return [...baseAngles, ...baseAngles].slice(0, participantCount);
        }
    }
}