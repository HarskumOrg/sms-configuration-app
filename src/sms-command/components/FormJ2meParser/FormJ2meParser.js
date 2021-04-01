import { PropTypes } from '@dhis2/prop-types'
import {
    CenteredContent,
    CircularLoader,
    NoticeBox,
    ReactFinalForm,
} from '@dhis2/ui'
import React from 'react'
import i18n from '../../../locales'
import { dataTest as createDataTestValue } from '../../../shared'
import { FIELD_DATA_SET_NAME } from '../FieldDataSet'
import { FIELD_SPECIAL_CHARS_NAME } from '../FieldSpecialCharacter'
import { FormComponent } from './FormComponent'
import { getInitialFormState } from './getInitialFormState'
import { globalValidate } from './globalValidate'
import { useCommandData } from './useCommandData'
import { useUpdateCommandMutation } from './useUpdateCommandMutation'

const { Form } = ReactFinalForm

export const FormJ2meParser = ({ commandId, onAfterChange, onCancel }) => {
    const dataTest = createDataTestValue(
        'smscommandkeyvalueparser-commandeditj2meparserform'
    )

    const { error: loadingCommandError, data: commandData } = useCommandData(
        commandId
    )

    const command = commandData?.smsCommand

    const updateCommand = useUpdateCommandMutation({
        commandId,
        onAfterChange,
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

    const specialChars = initialValues[FIELD_SPECIAL_CHARS_NAME]
    const hasSpecialChars = !!specialChars?.length

    return (
        <Form
            keepDirtyOnReinitialize
            onSubmit={updateCommand}
            initialValues={initialValues}
            validate={globalValidate}
            subscription={{ pristine: true }}
        >
            {({ handleSubmit, pristine, dirty }) => (
                <FormComponent
                    DE_COC_combination_data={DE_COC_combination_data}
                    dataTest={dataTest}
                    dirty={dirty}
                    handleSubmit={handleSubmit}
                    pristine={pristine}
                    hasSpecialChars={hasSpecialChars}
                    selectedDataSetOption={selectedDataSetOption}
                    onCancel={onCancel}
                />
            )}
        </Form>
    )
}

FormJ2meParser.propTypes = {
    commandId: PropTypes.string.isRequired,
    onAfterChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
}
