import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { useTranslation, Trans } from 'react-i18next'
import { Info } from '@aragon/ui'
import AddressLink from './AddressLink'
import SignerButton from './SignerButton'

const ImpossibleContent = ({
  error,
  intent: { description, name, to },
  onClose,
}) => {
  const { t } = useTranslation()
  return (
    <Fragment>
      <Info.Permissions title={t('Action impossible')}>
        {!description && !name && t('The action failed to execute')}
        {description &&
          !name &&
          t('The action “{description}” failed to execute', { description })}
        {!description && name && (
          <Trans i18nKey="i-action-failed-no-description">
            The action failed to execute
            <Fragment>
              on <AddressLink to={to}>{name}</AddressLink>}
            </Fragment>
          </Trans>
        )}
        {description && name && (
          <Trans i18nKey="i-action-failed-with-description">
            The action “{{ description }}” failed to execute
            <Fragment>
              on <AddressLink to={to}>{{ name }}</AddressLink>}
            </Fragment>
          </Trans>
        )}
        .{' '}
        {error
          ? t(
              'An error occurred when we tried to find a path or send a transaction for this action.'
            )
          : t('You may not have the required permissions.')}
      </Info.Permissions>
      <SignerButton onClick={onClose}>{t('Close')}</SignerButton>
    </Fragment>
  )
}

ImpossibleContent.propTypes = {
  error: PropTypes.bool,
  intent: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default ImpossibleContent
