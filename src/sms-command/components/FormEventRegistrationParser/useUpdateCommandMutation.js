import { useDataEngine } from '@dhis2/app-runtime'
import { useSubmit } from '../../../shared/utils'
import { FIELD_COMMAND_NAME } from '../FieldCommandName'
import { FIELD_DEFAULT_MESSAGE_NAME } from '../FieldDefaultMessage'
import { FIELD_MORE_THAN_ONE_ORG_UNIT_MESSAGE_NAME } from '../FieldMoreThanOneOrgUnitMessage'
import { FIELD_NO_USER_MESSAGE_NAME } from '../FieldNoUserMessage'
import { FIELD_PARSER_NAME } from '../FieldParser'
import { FIELD_PROGRAM_NAME } from '../FieldProgram'
import { FIELD_PROGRAM_STAGE_NAME } from '../FieldProgramStage'
import { FIELD_SEPARATOR_NAME } from '../FieldSeparator'
import { FIELD_SMS_CODES_NAME } from '../FieldSmsCode'
import { FIELD_SUCCESS_MESSAGE_NAME } from '../FieldSuccessMessage'
import { FIELD_WRONG_FORMAT_MESSAGE_NAME } from '../FieldWrongFormatMessage'

const updateEventRegistrationParserMutation = {
    resource: 'smsCommands',
    type: 'update',
    id: ({ id }) => id,
    data: command => {
        const name = command[FIELD_COMMAND_NAME]
        const parserType = command[FIELD_PARSER_NAME]
        const program = command[FIELD_PROGRAM_NAME]
        const programStage = command[FIELD_PROGRAM_STAGE_NAME]
        const separator = command[FIELD_SEPARATOR_NAME]
        const defaultMessage = command[FIELD_DEFAULT_MESSAGE_NAME]
        const wrongFormatMessage = command[FIELD_WRONG_FORMAT_MESSAGE_NAME]
        const noUserMessage = command[FIELD_NO_USER_MESSAGE_NAME]
        const moreThanOneOrgUnitMessage =
            command[FIELD_MORE_THAN_ONE_ORG_UNIT_MESSAGE_NAME]
        const successMessage = command[FIELD_SUCCESS_MESSAGE_NAME]
        const smsCodes = Object.values(command[FIELD_SMS_CODES_NAME])

        return {
            [FIELD_COMMAND_NAME]: name,
            [FIELD_PARSER_NAME]: parserType,
            [FIELD_PROGRAM_NAME]: program,
            [FIELD_PROGRAM_STAGE_NAME]: programStage,
            [FIELD_SEPARATOR_NAME]: separator,
            [FIELD_DEFAULT_MESSAGE_NAME]: defaultMessage,
            [FIELD_WRONG_FORMAT_MESSAGE_NAME]: wrongFormatMessage,
            [FIELD_NO_USER_MESSAGE_NAME]: noUserMessage,
            [FIELD_MORE_THAN_ONE_ORG_UNIT_MESSAGE_NAME]: moreThanOneOrgUnitMessage,
            [FIELD_SUCCESS_MESSAGE_NAME]: successMessage,
            [FIELD_SMS_CODES_NAME]: smsCodes,
        }
    },
}

export const useUpdateCommandMutation = ({ id, onAfterChange }) => {
    const engine = useDataEngine()
    const onSubmit = values => {
        const variables = { ...values, id }
        return engine
            .mutate(updateEventRegistrationParserMutation, { variables })
            .then(onAfterChange)
    }

    return useSubmit(onSubmit)
}
