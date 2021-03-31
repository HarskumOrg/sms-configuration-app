import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import i18n from '../../../locales'
import { CancelDialog, PageHeadline } from '../../../shared/components'
import { dataTest } from '../../../shared/utils'
import { FIELD_PARSER_NAME } from '../../components/FieldParser'
// @TODO(parser types): export object instead of individual constants
import {
    ALERT_PARSER,
    EVENT_REGISTRATION_PARSER,
    J2ME_PARSER,
    KEY_VALUE_PARSER,
    PROGRAM_STAGE_DATAENTRY_PARSER,
    TRACKED_ENTITY_REGISTRATION_PARSER,
    UNREGISTERED_PARSER,
} from '../../components/FieldParser/parserTypes'
import { FormAlertParser } from '../../components/FormAlertParser'
import { FormEventRegistrationParser } from '../../components/FormEventRegistrationParser'
import { FormJ2meParser } from '../../components/FormJ2meParser'
import { FormKeyValueParser } from '../../components/FormKeyValueParser'
import { FormProgramStageDataEntryParser } from '../../components/FormProgramStageDataEntryParser'
import { FormTrackedEntityRegistrationParser } from '../../components/FormTrackedEntityRegistrationParser'
import { FormUnregisteredParser } from '../../components/FormUnregisteredParser'
import { useReadSmsCommandParserTypeQuery } from '../../hooks'
import styles from './SmsCommandEdit.module.css'

export const SMS_COMMAND_FORM_EDIT_PATH_STATIC = '/sms-config/edit'
export const SMS_COMMAND_FORM_EDIT_PATH = `${SMS_COMMAND_FORM_EDIT_PATH_STATIC}/:id`

const isParserType = (parserType, parser) => parserType === parser.value

const getSmsCommandEditFormComponent = parserType => {
    const isParser = isParserType.bind(null, parserType)

    if (!parserType) {
        return null
    }

    if (isParser(KEY_VALUE_PARSER)) {
        return FormKeyValueParser
    }

    if (isParser(J2ME_PARSER)) {
        return FormJ2meParser
    }

    if (isParser(ALERT_PARSER)) {
        return FormAlertParser
    }

    if (isParser(PROGRAM_STAGE_DATAENTRY_PARSER)) {
        return FormProgramStageDataEntryParser
    }

    if (isParser(UNREGISTERED_PARSER)) {
        return FormUnregisteredParser
    }

    if (isParser(EVENT_REGISTRATION_PARSER)) {
        return FormEventRegistrationParser
    }

    if (isParser(TRACKED_ENTITY_REGISTRATION_PARSER)) {
        return FormTrackedEntityRegistrationParser
    }

    return null
}

export const SmsCommandEdit = () => {
    const history = useHistory()
    const { id } = useParams()
    const { loading, error, data } = useReadSmsCommandParserTypeQuery(id)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const onAfterChange = () => history.push('/sms-command')
    const onCancel = pristine =>
        pristine ? history.goBack() : setShowCancelDialog(true)

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    if (error) {
        const msg = i18n.t('Something went wrong whilst loading commands')

        return (
            <NoticeBox error title={msg}>
                {error.message}
            </NoticeBox>
        )
    }

    const parserType = data?.smsCommand[FIELD_PARSER_NAME]
    const FormComponent = getSmsCommandEditFormComponent(parserType)

    return (
        <div
            className={styles.container}
            data-test={dataTest('views-smscommandformedit')}
        >
            <PageHeadline>{i18n.t('Edit command')}</PageHeadline>

            {FormComponent && (
                <FormComponent
                    commandId={id}
                    onCancel={onCancel}
                    onAfterChange={onAfterChange}
                />
            )}

            {showCancelDialog && (
                <CancelDialog
                    onConfirmCancel={() => history.push('/sms-command')}
                    onAbortCancel={() => setShowCancelDialog(false)}
                />
            )}

            {!parserType && (
                <NoticeBox error title={i18n.t('Unrecognised parser type')}>
                    {i18n.t('Could not find the requested parser type')}
                </NoticeBox>
            )}
        </div>
    )
}
