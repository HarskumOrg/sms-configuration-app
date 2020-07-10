import { AlertBar, AlertStack } from '@dhis2/ui'
import React, { useState } from 'react'
import { PropTypes } from '@dhis2/prop-types'

import { AlertContext } from './AlertContext'
import { dataTest } from '../dataTest'

export const AlertHandler = ({ children }) => {
    const [alerts, setAlerts] = useState([])
    const addAlert = alert => setAlerts([...alerts, alert])

    return (
        <AlertContext.Provider value={{ addAlert }}>
            {children}

            <AlertStack dataTest={dataTest('notifications-alerthandler')}>
                {alerts.map(({ message, type }) => (
                    <AlertBar
                        dataTest={dataTest('notifications-alert')}
                        key={message}
                        {...{ [type]: true }}
                    >
                        {message}
                    </AlertBar>
                ))}
            </AlertStack>
        </AlertContext.Provider>
    )
}

AlertHandler.propTypes = {
    children: PropTypes.any,
}
