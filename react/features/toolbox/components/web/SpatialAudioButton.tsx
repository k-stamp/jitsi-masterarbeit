import { connect } from 'react-redux';

import { createToolbarEvent } from '../../../analytics/AnalyticsEvents';
import { sendAnalytics } from '../../../analytics/functions';
import { IReduxState } from '../../../app/types';
import { SPATIAL_AUDIO_ENABLED } from '../../../base/flags/constants';
import { getFeatureFlag } from '../../../base/flags/functions';
import { translate } from '../../../base/i18n/functions';
import { IconOrbitAlt } from '../../../base/icons/svg';
import AbstractButton, { IProps as AbstractButtonProps } from '../../../base/toolbox/components/AbstractButton';
import { toggleSpatialAudio } from '../../../video-layout/actions.any';

interface IProps extends AbstractButtonProps {
    _spatialAudioEnabled: boolean;
}

class SpatialAudioButton extends AbstractButton<IProps> {
    accessibilityLabel = 'toolbar.accessibilityLabel.spatialAudio';
    icon = IconOrbitAlt;
    label = 'toolbar.switchToSpatial';
    toggledLabel = 'toolbar.switchToMono';
    tooltip = 'toolbar.spatialAudioToggle';

    _handleClick() {
        const { dispatch, _spatialAudioEnabled } = this.props;

        sendAnalytics(createToolbarEvent(
            'spatial.button',
            {
                'is_enabled': _spatialAudioEnabled
            }));

        dispatch(toggleSpatialAudio());
    }

    _isToggled() {
        return this.props._spatialAudioEnabled;
    }
}


function _mapStateToProps(state: any, ownProps: any) {
    const enabled = getFeatureFlag(state, SPATIAL_AUDIO_ENABLED, true);
    const { visible = enabled } = ownProps;

    return {
        _spatialAudioEnabled: (window as any).spatialAudio,
        visible
    };
}

export default translate(connect(_mapStateToProps)(SpatialAudioButton)); 