import { PropTypes } from '@dhis2/prop-types'
import { MenuItem } from '@dhis2/ui'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { dataTest } from '../../utils'
import styles from './NavigationItem.module.css'

const useIsItemActive = (path, exactMatch) => {
    const routeMatch = useRouteMatch(path)

    if (!routeMatch) return false
    if (exactMatch) return routeMatch.isExact
    return true
}

export const NavigationItem = ({ label, path, exactMatch }) => {
    const history = useHistory()
    const active = useIsItemActive(path, exactMatch)
    const navigateToPath = () => history.push(path)

    return (
        <MenuItem
            className={styles.item}
            onClick={navigateToPath}
            active={active}
            label={label}
            dataTest={dataTest('shared-navigationitem')}
        />
    )
}

NavigationItem.defualtProps = {
    exactMatch: false,
}

NavigationItem.propTypes = {
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    exactMatch: PropTypes.bool,
}
