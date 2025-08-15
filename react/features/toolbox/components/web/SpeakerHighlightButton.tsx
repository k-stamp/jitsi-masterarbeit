import { connect } from 'react-redux';

import { IReduxState } from '../../../app/types';
import { translate } from '../../../base/i18n/functions';
import { IconSpeakerHighlight } from '../../../base/icons/svg';
import AbstractButton, { IProps as AbstractButtonProps } from '../../../base/toolbox/components/AbstractButton';
import { toggleSpeakerHighlight } from '../../../speaker-highlight/actions';
import { isSpeakerHighlightEnabled } from '../../../speaker-highlight/functions';

interface IProps extends AbstractButtonProps {
    _speakerHighlightEnabled: boolean;
}

class SpeakerHighlightButton extends AbstractButton<IProps> {
    override accessibilityLabel = 'toolbar.accessibilityLabel.speakerHighlight';
    override icon = IconSpeakerHighlight;
    override label = 'toolbar.speakerHighlight';
    override tooltip = 'toolbar.speakerHighlight';

    override _handleClick() {
        const { dispatch, _speakerHighlightEnabled } = this.props;
        
        if (_speakerHighlightEnabled) {
            console.log('Speaker highlighting deaktiviert');
        } else {
            console.log('Speaker highlighting aktiviert');
        }
        
        dispatch(toggleSpeakerHighlight());
    }

    override _isToggled() {
        return this.props._speakerHighlightEnabled;
    }
}

function _mapStateToProps(state: IReduxState) {
    return {
        _speakerHighlightEnabled: isSpeakerHighlightEnabled(state)
    };
}

export default translate(connect(_mapStateToProps)(SpeakerHighlightButton)); 