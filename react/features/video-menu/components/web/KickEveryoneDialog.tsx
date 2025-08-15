import React from 'react';
import { connect } from 'react-redux';

import { translate } from '../../../base/i18n/functions';
import Dialog from '../../../base/ui/components/web/Dialog';
import AbstractKickEveryoneDialog, { type IProps, abstractMapStateToProps }
    from '../AbstractKickEveryoneDialog';


class KickEveryoneDialog extends AbstractKickEveryoneDialog {


    override render() {
        return (
            <Dialog
                ok = {{ translationKey: 'dialog.kickEveryoneButton' }}
                onSubmit = { this._onSubmit }
                titleKey = 'dialog.kickEveryoneTitle'>
                <div>
                    { this.props.t('dialog.kickEveryoneDialog') }
                </div>
            </Dialog>
        );
    }
}

export default translate(connect(abstractMapStateToProps)(KickEveryoneDialog));