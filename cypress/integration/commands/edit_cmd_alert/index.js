import { Before, Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

Before(() => {
    cy.fixture('commands/edit_cmd_alert/commandsForListView').then(
        ({ smsCommands }) => {
            const [command] = smsCommands
            const { id: commandId } = command

            cy.intercept(/\/smsCommands[?]/, {
                method: 'GET',
                fixture: 'commands/edit_cmd_alert/commandsForListView',
            })

            cy.intercept('GET', new RegExp(`${commandId}[?].*=parserType&`), {
                fixture: 'commands/edit_cmd_alert/commandParserType',
            })

            cy.intercept(
                'GET',
                new RegExp(`${commandId}[?].*receivedMessage`),
                {
                    fixture: 'commands/edit_cmd_alert/commandDetails',
                }
            )

            cy.intercept('PATCH', new RegExp(`smsCommands/${commandId}`), {
                body: {},
            }).as('updateSmsCommandXhr')
        }
    )
})

Given('the user is editing an alert parser command', () => {
    cy.visitWhenStubbed('/')
    cy.getWithDataTest('{shared-navigationitem}:nth-child(3)').click()
    // There's only one command in the mocked api response
    cy.getWithDataTest('{views-smscommandlist-commandtable} button').click()
})

When('the user changes the name field', () => {
    const newNameValue = 'A new name'

    cy.wrap({
        name: newNameValue,
    }).as('newValues')

    cy.getWithDataTest('{smscommand-fieldcommandname} input')
        .clear()
        .type(newNameValue)
})

When('the user changes the confirmMessage field', () => {
    const newConfirmMessageValue = 'New confirm message'

    cy.wrap({
        receivedMessage: newConfirmMessageValue,
    }).as('newValues')

    cy.getWithDataTest('{smscommand-fieldconfirmmessage} textarea')
        .clear()
        .type(newConfirmMessageValue)
})

When('the user changes the name field to an invalid value', () => {
    cy.getWithDataTest('{smscommand-fieldcommandname} input').clear()
})

When('the user submits the form', () => {
    cy.getWithDataTest(
        '{smscommand-viewsmscommandedit} button[type="submit"]'
    ).click()
})

Then('the complete command should be sent to the endpoint', () => {
    cy.all(
        () => cy.wait('@updateSmsCommandXhr'),
        () => cy.fixture('commands/edit_cmd_alert/commandDetails')
    ).then(([xhr, smsCommand]) => {
        const payload = xhr.request.body
        const payloadKeys = Object.keys(payload)
        const commandKeys = Object.keys(smsCommand)

        cy.wrap(payload).as('updateRequestPayload')

        expect(payloadKeys.length).to.equal(commandKeys.length)

        commandKeys.forEach(commandKey => {
            expect(payloadKeys).to.include(commandKey)
        })
    })
})

Then(
    'the value of the changed name field should be reflected in the payload',
    () => {
        cy.all(
            () => cy.get('@updateRequestPayload'),
            () => cy.get('@newValues')
        ).then(([updateRequestPayload, newValues]) => {
            expect(updateRequestPayload.name).to.equal(newValues.name)
        })
    }
)

Then(
    'the value of the changed confirmMessage field should be reflected in the payload',
    () => {
        cy.all(
            () => cy.get('@updateRequestPayload'),
            () => cy.get('@newValues')
        ).then(([updateRequestPayload, newValues]) => {
            expect(updateRequestPayload.receivedMessage).to.equal(
                newValues.receivedMessage
            )
        })
    }
)

Then('the form should not submit successfully', () => {
    cy.getWithDataTest('{smscommand-viewsmscommandlist}').should('not.exist')
})
