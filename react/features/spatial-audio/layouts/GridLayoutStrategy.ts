import { ILayoutStrategy, ISpatialPosition } from '../types';

export class GridLayoutStrategy implements ILayoutStrategy {
    calculatePositions(participantCount: number): ISpatialPosition[] {
        const positions: ISpatialPosition[] = [];
        
        for (let index = 0; index < participantCount; index++) {
            positions.push(this.getPositionForIndex(index, participantCount));
        }
        
        return positions;
    }
    
    getPositionForIndex(index: number, totalCount: number): ISpatialPosition {
        let xPos = 0;
        let yPos = 0;
        
        if (totalCount <= 4) {
            if (totalCount > 1) {
                xPos = ((index / (totalCount - 1)) * 4) - 2; // Range: -2 to +2
            }
            yPos = 0;
            
        } else if (totalCount <= 8) {
            const participantsPerRow = Math.ceil(totalCount / 2);
            const row = Math.floor(index / participantsPerRow);
            const indexInRow = index % participantsPerRow;
            const participantsInThisRow = row === 0 ? participantsPerRow : totalCount - participantsPerRow;
            
            if (participantsInThisRow > 1) {
                xPos = ((indexInRow / (participantsInThisRow - 1)) * 4) - 2; // Range: -2 to +2
            }
            
            yPos = row === 0 ? 1 : -1;
            
        } else if (totalCount <= 12) {
            const participantsPerRow = Math.ceil(totalCount / 3);
            const row = Math.floor(index / participantsPerRow);
            const indexInRow = index % participantsPerRow;
            
            let participantsInThisRow;
            if (row === 0) {
                participantsInThisRow = Math.min(participantsPerRow, totalCount);
            } else if (row === 1) {
                participantsInThisRow = Math.min(participantsPerRow, totalCount - participantsPerRow);
            } else {
                participantsInThisRow = totalCount - (2 * participantsPerRow);
            }
            
            if (participantsInThisRow > 1) {
                xPos = ((indexInRow / (participantsInThisRow - 1)) * 4) - 2; // Range: -2 to +2
            }
            
            if (row === 0) {
                yPos = 1.5;
            } else if (row === 1) {
                yPos = 0;
            } else {
                yPos = -1.5;
            }
            
        } else {
            if (totalCount > 1) {
                xPos = ((index / (totalCount - 1)) * 4) - 2;
            }
            yPos = 0;
        }
        
        return { x: xPos, y: yPos, z: 0 };
    }
} 