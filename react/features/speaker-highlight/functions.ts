import { IReduxState } from '../app/types';


export function isSpeakerHighlightEnabled(state: IReduxState): boolean {
    return state['features/speaker-highlight']?.enabled ?? true;
} 