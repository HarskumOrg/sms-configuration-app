import { PropTypes } from '@dhis2/prop-types'
import moment from 'moment'
import React from 'react'
import styles from './Date.module.css'

export const Date = ({ date }) => {
    const momentDate = moment(date)
    const formatted = momentDate.format('DD MMM YYYY')

    return <span className={styles.date}>{formatted}</span>
}

Date.propTypes = {
    date: PropTypes.string.isRequired,
}
