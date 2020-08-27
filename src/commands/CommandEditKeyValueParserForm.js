import {
    CenteredContent,
    CircularLoader,
    NoticeBox,
    ReactFinalForm,
} from '@dhis2/ui'
import { PropTypes } from '@dhis2/prop-types'
import React from 'react'

import { ALL_DATAVALUE, AT_LEAST_ONE_DATAVALUE } from './completenessMethods'
import {
    FIELD_COMMAND_COMPLETENESS_METHOD_NAME,
    FIELD_COMMAND_DEFAULT_MESSAGE_NAME,
    FIELD_COMMAND_MORE_THAN_ONE_ORG_UNIT_MESSAGE_NAME,
    FIELD_COMMAND_NAME_NAME,
    FIELD_COMMAND_NO_USER_MESSAGE_NAME,
    FIELD_COMMAND_PARSER_NAME,
    FIELD_COMMAND_SEPARATOR_NAME,
    FIELD_COMMAND_SMS_CODES_NAME,
    FIELD_COMMAND_SPECIAL_CHARS_NAME,
    FIELD_COMMAND_SUCCESS_MESSAGE_NAME,
    FIELD_COMMAND_USE_CURRENT_PERIOD_FOR_REPORTING_NAME,
    FIELD_COMMAND_WRONG_FORMAT_MESSAGE_NAME,
} from './fieldNames'
import { KEY_VALUE_PARSER } from './types'
import { CommandsAddSpecialCharacters } from './CommandsAddSpecialCharacters'
import { DataElementTimesCategoryOptionCombos } from './DataElementTimesCategoryOptionCombos'
import { FieldCommandCompletenessMethod } from './FieldCommandCompletenessMethod'
import { FieldCommandDefaultMessage } from './FieldCommandDefaultMessage'
import { FieldCommandMoreThanOneOrgUnitMessage } from './FieldCommandMoreThanOneOrgUnitMessage'
import { FieldCommandName } from './FieldCommandName'
import { FieldCommandNoUserMessage } from './FieldCommandNoUserMessage'
import { FieldCommandParser } from './FieldCommandParser'
import { FieldCommandSeparator } from './FieldCommandSeparator'
import { FieldCommandSpecialCharacter } from './FieldCommandSpecialCharacter'
import { FieldCommandSuccessMessage } from './FieldCommandSuccessMessage'
import { FieldCommandUseCurrentPeriodForReporting } from './FieldCommandUseCurrentPeriodForReporting'
import { FieldCommandWrongFormatMessage } from './FieldCommandWrongFormatMessage'
import { FIELD_DATA_SET_NAME, FieldDataSet } from '../dataSet'
import { FormRow } from '../forms'
import { SaveCommandButton } from './SaveCommandButton'
import { SubmitErrors } from './SubmitErrors'
import { dataTest } from '../dataTest'
import { getSmsCodeDuplicates } from './getSmsCodeDuplicates'
import { useReadSmsCommandKeyValueParserQuery } from './useReadSmsCommandKeyValueParserQuery'
import { useUpdateCommand } from './useUpdateCommand'
import i18n from '../locales'

const { Form, FormSpy } = ReactFinalForm

const getInitialFormState = command => {
    const name = command[FIELD_COMMAND_NAME_NAME]
    const parserType = KEY_VALUE_PARSER.value
    const dataSetId = { id: command[FIELD_DATA_SET_NAME].id }
    const separator = command[FIELD_COMMAND_SEPARATOR_NAME]
    const completenessMethod =
        command[FIELD_COMMAND_COMPLETENESS_METHOD_NAME] || ALL_DATAVALUE.value
    const useCurrentPeriodForReporting =
        command[FIELD_COMMAND_USE_CURRENT_PERIOD_FOR_REPORTING_NAME]
    const defaultMessage = command[FIELD_COMMAND_DEFAULT_MESSAGE_NAME]
    const wrongFormatMessage = command[FIELD_COMMAND_WRONG_FORMAT_MESSAGE_NAME]
    const noUserMessage = command[FIELD_COMMAND_NO_USER_MESSAGE_NAME]
    const moreThanOneOrgUnitMessage =
        command[FIELD_COMMAND_MORE_THAN_ONE_ORG_UNIT_MESSAGE_NAME]
    const successMessage = command[FIELD_COMMAND_SUCCESS_MESSAGE_NAME]
    const smsCodes = command[FIELD_COMMAND_SMS_CODES_NAME].reduce(
        (acc, { code, compulsory, formula, optionId, dataElement }) => {
            const key =
                optionId < 10 ? dataElement.id : `${dataElement.id}-${optionId}`

            const smsCode = { code, compulsory, optionId }

            if (formula) {
                smsCode.formula = formula
            }

            return {
                ...acc,
                [key]: smsCode,
            }
        },
        {}
    )
    const specialCharacters = command[FIELD_COMMAND_SPECIAL_CHARS_NAME] || []

    return {
        [FIELD_COMMAND_NAME_NAME]: name,
        [FIELD_COMMAND_PARSER_NAME]: parserType,
        [FIELD_DATA_SET_NAME]: dataSetId,
        [FIELD_COMMAND_SEPARATOR_NAME]: separator,
        [FIELD_COMMAND_COMPLETENESS_METHOD_NAME]: completenessMethod,
        [FIELD_COMMAND_USE_CURRENT_PERIOD_FOR_REPORTING_NAME]: useCurrentPeriodForReporting,
        [FIELD_COMMAND_DEFAULT_MESSAGE_NAME]: defaultMessage,
        [FIELD_COMMAND_WRONG_FORMAT_MESSAGE_NAME]: wrongFormatMessage,
        [FIELD_COMMAND_NO_USER_MESSAGE_NAME]: noUserMessage,
        [FIELD_COMMAND_MORE_THAN_ONE_ORG_UNIT_MESSAGE_NAME]: moreThanOneOrgUnitMessage,
        [FIELD_COMMAND_SUCCESS_MESSAGE_NAME]: successMessage,
        smsCodes,
        specialCharacters,
    }
}

const globalValidate = DE_COC_combination_data => values => {
    const errors = {}

    const completenessMethod = values[FIELD_COMMAND_COMPLETENESS_METHOD_NAME]
    const smsCodesFormState = values[FIELD_COMMAND_SMS_CODES_NAME]
    const smsCodes = smsCodesFormState ? Object.entries(smsCodesFormState) : []
    const smsCodesWithValue = smsCodes.filter(([_, { code }]) => code) //eslint-disable-line no-unused-vars

    if (
        completenessMethod === ALL_DATAVALUE.value &&
        smsCodesWithValue.length !== DE_COC_combination_data?.length
    ) {
        errors[FIELD_COMMAND_SMS_CODES_NAME] =
            errors[FIELD_COMMAND_SMS_CODES_NAME] || {}

        errors[FIELD_COMMAND_SMS_CODES_NAME] = {
            global: i18n.t(
                `With completeness method "${ALL_DATAVALUE.label}", all sms codes need to have a value`
            ),
        }
    } else if (
        completenessMethod === AT_LEAST_ONE_DATAVALUE.value &&
        !smsCodesWithValue.length
    ) {
        errors[FIELD_COMMAND_SMS_CODES_NAME] =
            errors[FIELD_COMMAND_SMS_CODES_NAME] || {}

        Object.assign(errors[FIELD_COMMAND_SMS_CODES_NAME], {
            global: i18n.t(
                `With completeness method "${AT_LEAST_ONE_DATAVALUE.label}", you need to provide at least one value`
            ),
        })
    }

    if (smsCodesWithValue.length) {
        const duplicates = getSmsCodeDuplicates(smsCodesWithValue)

        if (duplicates.length) {
            const duplicateErrors = {}

            duplicates.forEach(duplicate => {
                duplicateErrors[duplicate] = {
                    code: i18n.t('Duplicate value!'),
                }
            })

            errors[FIELD_COMMAND_SMS_CODES_NAME] =
                errors[FIELD_COMMAND_SMS_CODES_NAME] || {}

            Object.assign(errors[FIELD_COMMAND_SMS_CODES_NAME], duplicateErrors)
        }
    }

    return errors
}

const formatSmsCodes = updates => {
    const smsCodes = updates[FIELD_COMMAND_SMS_CODES_NAME]
    const formattedSmsCodes = Object.entries(smsCodes).map(
        ([id, { code, formula, compulsory, optionId }]) => {
            const [dataElementId] = id.split('-')
            const formattedSmsCode = {
                code,
                compulsory,
                dataElement: { id: dataElementId },
            }

            if (formula) {
                formattedSmsCode.formula = formula
            }

            if (optionId) {
                formattedSmsCode.optionId = optionId
            }

            return formattedSmsCode
        }
    )

    return {
        ...updates,
        [FIELD_COMMAND_SMS_CODES_NAME]: formattedSmsCodes,
    }
}

export const CommandEditKeyValueParserForm = ({ commandId, onAfterChange }) => {
    const {
        error: loadingCommandError,
        data: commandData,
    } = useReadSmsCommandKeyValueParserQuery(commandId)

    const command = commandData?.smsCommand

    const updateCommand = useUpdateCommand({
        commandId,
        onAfterChange,
        formatCommand: formatSmsCodes,
    })

    if (loadingCommandError) {
        const msg = i18n.t(
            "Something went wrong whilst loading the command's details"
        )

        return (
            <NoticeBox error title={msg}>
                {loadingCommandError.message}
            </NoticeBox>
        )
    }

    if (!command) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    const selectedDataSetOption = {
        value: command[FIELD_DATA_SET_NAME].id,
        label: command[FIELD_DATA_SET_NAME].displayName,
    }

    const initialValues = getInitialFormState(command)
    const DE_COC_combination_data = command.dataset.dataSetElements.reduce(
        (curCombinations, { dataElement }) => {
            const categoryOptionCombo =
                dataElement.categoryCombo?.categoryOptionCombo

            if (!categoryOptionCombo) {
                return [...curCombinations, { dataElement }]
            }

            const combos = categoryOptionCombo.map(COC => ({
                dataElement,
                categoryOptionCombo: COC,
            }))

            return [...curCombinations, ...combos]
        },
        []
    )

    return (
        <Form
            onSubmit={updateCommand}
            initialValues={initialValues}
            subscription={{ submitting: true, pristine: true }}
            validate={globalValidate(DE_COC_combination_data)}
        >
            {({ handleSubmit, submitting, form }) => (
                <form
                    onSubmit={handleSubmit}
                    data-test={dataTest(
                        'commands-commandeditkeyvalueparserform'
                    )}
                >
                    {submitting && <p>SUBMITTING....</p>}

                    <FormRow>
                        <FieldCommandName />
                    </FormRow>

                    <FormRow>
                        <FieldCommandParser disabled />
                    </FormRow>

                    <FormRow>
                        <FieldDataSet
                            disabled
                            dataSets={[selectedDataSetOption]}
                        />
                    </FormRow>

                    <FormRow>
                        <FieldCommandCompletenessMethod />
                    </FormRow>

                    <FormRow>
                        <FieldCommandUseCurrentPeriodForReporting />
                    </FormRow>

                    <FormRow>
                        <FieldCommandSeparator />
                    </FormRow>

                    <FormRow>
                        <FieldCommandDefaultMessage />
                    </FormRow>

                    <FormRow>
                        <FieldCommandWrongFormatMessage />
                    </FormRow>

                    <FormRow>
                        <FieldCommandNoUserMessage />
                    </FormRow>

                    <FormRow>
                        <FieldCommandMoreThanOneOrgUnitMessage />
                    </FormRow>

                    <FormRow>
                        <FieldCommandSuccessMessage />
                    </FormRow>

                    {DE_COC_combination_data && (
                        <FormSpy subscription={{ values: true }}>
                            {({ values }) => {
                                const completenessMethod =
                                    values[
                                        FIELD_COMMAND_COMPLETENESS_METHOD_NAME
                                    ]
                                const allRequired =
                                    completenessMethod === ALL_DATAVALUE.value

                                return (
                                    <DataElementTimesCategoryOptionCombos
                                        allRequired={allRequired}
                                        DE_COC_combinations={
                                            DE_COC_combination_data
                                        }
                                    />
                                )
                            }}
                        </FormSpy>
                    )}

                    <div>
                        <h2>Special characters</h2>

                        <FormSpy subscription={{ values: true }}>
                            {({ values }) => (
                                <>
                                    {values[
                                        FIELD_COMMAND_SPECIAL_CHARS_NAME
                                    ].map((_, index) => (
                                        <FormRow key={index}>
                                            <FieldCommandSpecialCharacter
                                                index={index}
                                            />
                                        </FormRow>
                                    ))}
                                </>
                            )}
                        </FormSpy>

                        <CommandsAddSpecialCharacters />

                        <FormRow>
                            <hr />
                        </FormRow>
                    </div>

                    <SubmitErrors />
                    <SaveCommandButton />
                </form>
            )}
        </Form>
    )
}

CommandEditKeyValueParserForm.propTypes = {
    commandId: PropTypes.string.isRequired,
    onAfterChange: PropTypes.func.isRequired,
}