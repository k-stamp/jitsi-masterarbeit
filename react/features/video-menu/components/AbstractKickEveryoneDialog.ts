import { Component } from 'react';
import { WithTranslation } from 'react-i18next';

import { createToolbarEvent } from '../../analytics/AnalyticsEvents';
import { sendAnalytics } from '../../analytics/functions';
import { IReduxState, IStore } from '../../app/types';
import { isLocalParticipantModerator } from '../../base/participants/functions';

import { kickAllParticipants } from '../actions.any';

export interface IProps extends WithTranslation {

    dispatch: IStore['dispatch'];
    isModerator?: boolean;
}

export default class AbstractKickEveryoneDialog extends Component<IProps> {

    constructor(props: IProps) {
        super(props);

        this._onSubmit = this._onSubmit.bind(this);
    }

    _onSubmit() {
        const { dispatch } = this.props;

        sendAnalytics(createToolbarEvent('kick.everyone.pressed'));
        dispatch(kickAllParticipants());

        return true;
    }
}


export function abstractMapStateToProps(state: IReduxState, ownProps: any) {
    return {
        ...ownProps,
        isModerator: isLocalParticipantModerator(state)
    };
}