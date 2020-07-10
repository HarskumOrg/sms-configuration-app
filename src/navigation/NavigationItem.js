import { useHistory, useRouteMatch } from 'react-router-dom'
import { MenuItem } from '@dhis2/ui'
import { PropTypes } from '@dhis2/prop-types'
import React from 'react'
import { dataTest } from '../dataTest'

export const NavigationItem = ({ label, path }) => {
    const history = useHistory()
    const routeMatch = useRouteMatch(path)
    const active = routeMatch && routeMatch.isExact
    const navigateToPath = () => history.push(path)

    return (
        <MenuItem
            onClick={navigateToPath}
            active={active}
            label={label}
            dataTest={dataTest('navigation-navigationitem')}
        />
    )
}

NavigationItem.propTypes = {
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
}
