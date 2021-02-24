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
        configurationTemplate: 'A sample value',
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
        configurationTemplate: 'A sample value',
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
        configurationTemplate: 'A sample value',
        parameters: [],
    },
]

Given('the user navigated to the gateway configuration page', () => {
    cy.route({
        url: /.*\/gateways.json$/,
        method: 'GET',
        response: { gateways },
    })

    gateways.forEach(gateway => {
        const { uid } = gateway

        cy.route({
            url: new RegExp(`.*/gateways/${uid}`),
            response: gateway,
        })

        cy.route({
            url: new RegExp(`.*/gateways/${uid}`),
            method: 'PUT',
            response: {},
        }).as(`updateGatewayConfiguration${uid}XHR`)
    })

    cy.visitWhenStubbed('/')
    cy.getWithDataTest('{navigation-navigationitem}:nth-child(2)').click()
})

When('the user clicks on the update button in the first row', () => {
    cy.getWithDataTest(
        '{gateways-gatewaystable-row}:first-child {gateways-gatewaystable-edit}'
    ).click()

    cy.wrap(gateways[0])
        .as('editedGatewayConfiguration')
        .as('finalGatewayConfiguration')
})

When("the user changes the name field's value to another valid value", () => {
    cy.getWithDataTest('{gateways-fieldgatewayname} input')
        .clear()
        .type('New name value')

    cy.get('@finalGatewayConfiguration').then(finalGatewayConfiguration => {
        cy.wrap({
            ...finalGatewayConfiguration,
            name: 'New name value',
        }).as('finalGatewayConfiguration')
    })
})

When(
    "the user changes the urlTemplate field's value to another valid value",
    () => {
        cy.getWithDataTest('{gateways-fieldgatewayurltemplate} input')
            .clear()
            .type('http://another-domain.tld')

        cy.get('@finalGatewayConfiguration').then(finalGatewayConfiguration => {
            cy.wrap({
                ...finalGatewayConfiguration,
                urlTemplate: 'http://another-domain.tld',
            }).as('finalGatewayConfiguration')
        })
    }
)

When(
    "the user changes the parameters field's value to another valid value",
    () => {
        const keyValuePairs = [
            {
                key: 'Key One',
                value: 'Value One',
                header: true,
                confidential: false,
                encode: false,
            },
            {
                key: 'Key Two',
                value: 'Value Two',
                header: false,
                confidential: true,
                encode: false,
            },
            {
                key: 'Key Three',
                value: 'Value Trhee',
                header: false,
                confidential: false,
                encode: true,
            },
        ]

        keyValuePairs.forEach(keyValuePair => {
            const { key, value, header, confidential, encode } = keyValuePair

            cy.getWithDataTest('{gateways-gatewayaddkeyvaluepair}').click()
            cy.getWithDataTest('{gateways-gatewaykeyvaluepair}')
                .last()
                .as('lastKeyValuePair')

            cy.get('@lastKeyValuePair')
                .findWithDataTest('{gateways-gatewaykeyvaluepair-key}')
                .type(key)

            cy.get('@lastKeyValuePair')
                .findWithDataTest('{gateways-gatewaykeyvaluepair-value}')
                .type(value)

            if (header) {
                cy.get('@lastKeyValuePair')
                    .findWithDataTest(
                        '{gateways-gatewaykeyvaluepair-isheader} label'
                    )
                    .click()
            }

            if (confidential) {
                cy.get('@lastKeyValuePair')
                    .findWithDataTest(
                        '{gateways-gatewaykeyvaluepair-isconfidential} label'
                    )
                    .click()
            }

            if (encode) {
                cy.get('@lastKeyValuePair')
                    .findWithDataTest(
                        '{gateways-gatewaykeyvaluepair-isencoded} label'
                    )
                    .click()
            }
        })

        cy.get('@finalGatewayConfiguration').then(finalGatewayConfiguration => {
            cy.wrap({
                ...finalGatewayConfiguration,
                parameters: gateways.parameters
                    ? [...gateways.parameters, ...keyValuePairs]
                    : keyValuePairs,
            }).as('finalGatewayConfiguration')
        })
    }
)

When('submits the form', () => {
    cy.getWithDataTest('{forms-gatewaygenericform-submit}').click()
})

When("the user changes the name field's value to another invalid value", () => {
    cy.getWithDataTest('{gateways-fieldgatewayname}')
        .as('invalidField')
        .find('input')
        .clear()
})

When(
    "the user changes the urlTemplate field's value to another invalid value",
    () => {
        cy.getWithDataTest('{gateways-fieldgatewayurltemplate}')
            .as('invalidField')
            .find('input')
            .clear()
            .type('Invalid url value')
    }
)

When('the user changes some fields to valid values', () => {
    cy.getWithDataTest('{gateways-fieldgatewayname} input')
        .clear()
        .type('A valid name')
})

Then('the app should navigate to the update form', () => {
    cy.getWithDataTest('{views-gatewayconfigformedit}').should('exist')
    cy.getWithDataTest('{views-gatewayconfigformedit-formcontainer}')
        .invoke('attr', 'data-gateway-id')
        .as('gatewayId')
})

Then(
    'the input fields contain the information of the chosen gateway configuration',
    () => {
        cy.all(
            () => cy.get('@editedGatewayConfiguration'),
            () => cy.getWithDataTest('{gateways-fieldgatewayname} input'),
            () => cy.getWithDataTest('{gateways-fieldgatewayurltemplate} input')
        ).then(
            ([editedGatewayConfiguration, $nameInput, $urlTemplateInput]) => {
                const { name, urlTemplate } = editedGatewayConfiguration
                expect($nameInput.val()).to.eql(name)
                expect($urlTemplateInput.val()).to.eql(urlTemplate)
            }
        )

        cy.get('@editedGatewayConfiguration').then(({ parameters }) => {
            if (parameters.length) {
                cy.getWithDataTest('{gateways-gatewaykeyvaluepair}').should(
                    'have.lengthOf',
                    parameters.length
                )
            } else {
                cy.getWithDataTest('{gateways-gatewaykeyvaluepair}').should(
                    'not.exist'
                )
            }
        })
    }
)

Then('the updates should be sent to the correct endpoint', () => {
    cy.get('@gatewayId').then(id => {
        cy.all(
            () => cy.wait(`@updateGatewayConfiguration${id}XHR`),
            () => cy.get('@finalGatewayConfiguration')
        ).then(([xhr, finalGatewayConfiguration]) => {
            expect(xhr.status).to.equal(200)

            const sentData = xhr.request.body
            const { name, urlTemplate, parameters } = finalGatewayConfiguration

            expect(sentData.name).to.equal(name)
            expect(sentData.urlTemplate).to.equal(urlTemplate)
            expect(sentData.parameters).to.eql(parameters)
        })
    })
})

Then('the form does not submit', () => {
    cy.getWithDataTest('{views-gatewayconfiglist}').should('not.exist')
})

Then('an error message should be shown at the invalid field', () => {
    cy.get('@invalidField')
        .find('.error')
        .should('exist')
})

Then(
    'the user should be redirected to the gateway configuration overview page',
    () => {
        cy.getWithDataTest('{views-gatewayconfiglist}').should('exist')
    }
)
