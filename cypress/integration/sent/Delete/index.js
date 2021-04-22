import { Then, When } from 'cypress-cucumber-preprocessor/steps'
import { apiRouteOptions } from '../common'

Then("the 'delete selected' button should be disabled", () => {
    cy.get('button.destructive').should('be.disabled')
})

Then("the 'delete selected' button should be enabled", () => {
    cy.get('button.destructive').should('be.enabled')
})

Then('the user should be asked to confirm his choice', () => {
    cy.get('{shared-deleteconfirmationdialog}').should('exist')
})

When('the user selects a message', () => {
    cy.route({
        method: 'DELETE',
        url: '**/sms/outbound?ids=sms_id_1',
        response: 'fixture:sent/deleteRes',
    }).as('sentMessageDeleted')
    cy.route({
        ...apiRouteOptions,
        response: 'fixture:sent/withoutFirstMessage',
    })

    cy.get('tbody [data-test="dhis2-uicore-checkbox"]:eq(0)')
        .click()
        .find('input')
        .should('be.checked')
})

When('the user selects all messages', () => {
    cy.route({
        method: 'DELETE',
        url: '**/sms/outbound?ids=sms_id_1,sms_id_2,sms_id_3',
        response: 'fixture:sent/deleteRes',
    }).as('sentMessagesDeleted')
    cy.route({
        ...apiRouteOptions,
        response: 'fixture:sent/noSent',
    }).as('noSentMessages')

    cy.get('thead [data-test="dhis2-uicore-checkbox"]')
        .click()
        .find('input')
        .should('be.checked')
    cy.get('tbody [data-test="dhis2-uicore-checkbox"] input').should(
        'be.checked'
    )
})

When("the user clicks on the 'delete selected' button", () => {
    cy.get('button.destructive').click()
})

When('the user confirms the deletion', () => {
    cy.get('{shared-deleteconfirmationdialog-confirm}').click()
})

Then('the message should be deleted', () => {
    cy.wait('@sentMessageDeleted')
    cy.get('tbody').children().should('have.length', 2)
})

Then('all the messages should be deleted', () => {
    cy.wait('@sentMessagesDeleted')
    cy.wait('@noSentMessages')
    cy.get('[data-test="dhis2-uicore-tablecell"]').should(
        'contain',
        'No SMSes to display'
    )
})
