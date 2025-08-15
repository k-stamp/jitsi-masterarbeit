import { connect } from 'react-redux';

import { createToolbarEvent } from '../../../analytics/AnalyticsEvents';
import { sendAnalytics } from '../../../analytics/functions';
import { IReduxState } from '../../../app/types';
import { translate } from '../../../base/i18n/functions';
import { IconMicSlash } from '../../../base/icons/svg';
import AbstractButton, { IProps as AbstractButtonProps } from '../../../base/toolbox/components/AbstractButton';
import { toggleMicIndicatorsVisibility } from '../../../settings/actions.native';


interface IProps extends AbstractButtonProps {
    _micIndicatorsVisible: boolean;
}


class ToggleMicIndicatorsButton extends AbstractButton<IProps> {
    accessibilityLabel = 'toolbar.accessibilityLabel.toggleMicIndicators';
    icon = IconMicSlash;
    label = 'toolbar.hideMicIndicators';
    toggledLabel = 'toolbar.showMicIndicators';


    _handleClick() {
        const { dispatch, _micIndicatorsVisible } = this.props;

        sendAnalytics(createToolbarEvent(
            'mic.indicators.button',
            {
                'is_visible': _micIndicatorsVisible
            }));

        dispatch(toggleMicIndicatorsVisibility());
    }


    _isToggled() {
        return !this.props._micIndicatorsVisible;
    }
}


function _mapStateToProps(state: IReduxState, ownProps: any) {
    return {
        ...ownProps,
        _micIndicatorsVisible: state['features/settings'].micIndicatorsVisible ?? false
    };
}

export default translate(connect(_mapStateToProps)(ToggleMicIndicatorsButton));