import { Before, Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

Before(() => {
    cy.server()
})

const gateways = [
    {
        type: 'http',
        uid: 'wRi738xEht',
        name: 'Foobarbaz',
        isDefault: true,
        urlTemplate: 'https://a.url.tld',
        useGet: false,
        contentType: 'FORM_URL_ENCODED',
        parameters: [],
    },
    {
        type: 'http',
        uid: 'wddjdkXLsD',
        name: 'asdf',
        isDefault: false,
        urlTemplate: 'http://d.dd',
        useGet: false,
        contentType: 'FORM_URL_ENCODED',
        parameters: [],
    },
    {
        type: 'http',
        uid: 'EylO7K98mx',
        name: 'foobar',
        isDefault: false,
        urlTemplate: 'http://d.dd',
        useGet: false,
        contentType: 'FORM_URL_ENCODED',
        parameters: [],
    },
]

const prepareGateways = gateways => {
    cy.wrap(gateways).as('gateways')
    cy.route({
        url: /.*\/gateways.json$/,
        method: 'GET',
        response: { gateways },
    })
}

Given('the user can delete configurations from the network perspective', () => {
    gateways.forEach(({ uid }) => {
        cy.route({
            url: new RegExp(`.*/gateways/${uid}$`),
            method: 'DELETE',
            response: {},
        }).as(`delete${uid}XHR`)
    })
})

Given("the user can't delete configurations due to a request failure", () => {
    gateways.forEach(({ uid }) => {
        cy.route({
            url: new RegExp(`.*/gateways/${uid}$`),
            method: 'DELETE',
            status: 503,
            response: {
                error: 'Internal server error',
            },
        }).as(`delete${uid}XHR`)
    })
})

Given('no gateways exist', () => {
    prepareGateways([])
})

Given('some gateways exist', () => {
    prepareGateways(gateways)
})

Given('the user navigated to the gateway configuration page', () => {
    cy.visitWhenStubbed('/')
    cy.getWithDataTest('{navigation-navigationitem}:nth-child(2)').click()
})

Given('the user wants to delete the first configuration', () => {
    cy.visitWhenStubbed('/')
    cy.getWithDataTest('{navigation-navigationitem}:nth-child(2)').click()
    cy.getWithDataTest('{gateways-gatewaystable-checkbox}')
        .first()
        .find('label')
        .click()
})

Given('the confirmation model is visible', () => {
    cy.getWithDataTest('{views-gatewayconfiglist-delete}').click()
    cy.getWithDataTest('{gateways-deleteconfirmationdialog}').should('exist')
})

Given('some gateway configurations have been selected', () => {
    cy.getWithDataTest('{gateways-gatewaystable-checkbox}')
        .first()
        .find('label')
        .click()
})

Given('all gateway configurations have been selected', () => {
    cy.getWithDataTest('{gateways-gatewaystable-checkall} label').click()
})

Given('no gateway configuration has been selected', () => {
    cy.getWithDataTest('{gateways-gatewaystable-checkbox} input').each(
        $checkbox => {
            expect($checkbox).to.not.be.checked
        }
    )
})

When('the user user selects the first gateway configuration', () => {
    cy.getWithDataTest('{gateways-gatewaystable-checkbox}')
        .first()
        .find('label')
        .click()
})

When('the user cancels the deletion', () => {
    cy.getWithDataTest('{gateways-deleteconfirmationdialog-cancel}').click()
})

When('the user confirms the deletion', () => {
    cy.getWithDataTest('{gateways-deleteconfirmationdialog-confirm}').click()
})

When('clicks the delete button', () => {
    cy.getWithDataTest('{views-gatewayconfiglist-delete}').click()
})

When('the user clicks the checkbox to select all', () => {
    cy.getWithDataTest('{gateways-gatewaystable-checkall} label').click()
})

Then('a confirmation model should pop up', () => {
    cy.getWithDataTest('{gateways-deleteconfirmationdialog}').should('exist')
})

Then(
    "a delete request with the first gateway configuration's id should be sent",
    () => {
        cy.wait(`@delete${gateways[0].uid}XHR`).then(xhr => {
            expect(xhr.status).to.equal(200)
        })
    }
)

Then('the confirmation modal should close', () => {
    cy.getWithDataTest('{gateways-deleteconfirmationdialog}').should(
        'not.exist'
    )
})

Then(
    "all individual gateway configurations' checkboxes should be selected",
    () => {
        cy.getWithDataTest('{gateways-gatewaystable-checkbox} input').each(
            $checkbox => {
                expect($checkbox).to.be.checked
            }
        )
    }
)

Then(
    "all individual gateway configurations' checkboxes should not be selected",
    () => {
        cy.getWithDataTest('{gateways-gatewaystable-checkbox} input').each(
            $checkbox => {
                expect($checkbox).to.not.be.checked
            }
        )
    }
)

Then('the delete button should be disabled', () => {
    cy.getWithDataTest('{views-gatewayconfiglist-delete}').should('be.disabled')
})

Then('an alert with an error message should be displayed', () => {
    cy.get('[data-test="dhis2-uicore-noticebox"].error')
        .should('exist')
        .should(
            'contain',
            'An unknown error occurred - Service Unavailable (503)'
        )
})
