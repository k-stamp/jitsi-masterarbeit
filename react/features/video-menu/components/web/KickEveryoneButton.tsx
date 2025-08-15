import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { openDialog } from '../../../base/dialog/actions';
import { IconUserDeleted } from '../../../base/icons/svg';
import { isLocalParticipantModerator } from '../../../base/participants/functions';
import ContextMenuItem from '../../../base/ui/components/web/ContextMenuItem';
import { NOTIFY_CLICK_MODE } from '../../../toolbox/types';

import KickEveryoneDialog from './KickEveryoneDialog';

interface IProps {
    notifyClick?: Function;
    notifyMode?: string;
}

const KickEveryoneButton = ({
    notifyClick,
    notifyMode
}: IProps): JSX.Element => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isModerator = useSelector(isLocalParticipantModerator);

    const handleClick = useCallback(() => {
        notifyClick?.();
        if (notifyMode === NOTIFY_CLICK_MODE.PREVENT_AND_NOTIFY) {
            return;
        }
        dispatch(openDialog(KickEveryoneDialog));
    }, [ dispatch, notifyMode, notifyClick ]);

    if (!isModerator) {
        return <></>;
    }

    return (
        <ContextMenuItem
            accessibilityLabel = { t('toolbar.accessibilityLabel.kickEveryone') }
            icon = { IconUserDeleted }
            onClick = { handleClick }
            text = { t('videothumbnail.kickEveryone') } />
    );
};

export default KickEveryoneButton;