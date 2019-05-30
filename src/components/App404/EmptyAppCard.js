import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { EmptyStateCard } from '@aragon/ui'
import notFoundIcon from './assets/not-found.svg'

const EmptyAppCard = ({ onActivate }) => {
  const { t } = useTranslation()
  return (
    <StyledEmptyStateCard
      actionText={t('Go back')}
      icon={NotFoundIcon}
      onActivate={onActivate}
      text={t('Are you trying to access an Aragon app that is not installed?')}
      title={t('Error: unknown app.')}
    />
  )
}

EmptyAppCard.propTypes = {
  onActivate: PropTypes.func.isRequired,
}

const StyledEmptyStateCard = styled(EmptyStateCard)`
  padding: 40px 20px;
  margin-bottom: 15px;
`

const NotFoundIcon = () => (
  <img width="60" height="60" src={notFoundIcon} alt="" />
)

export default EmptyAppCard
