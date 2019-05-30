import React from 'react'
import { SafeLink } from '@aragon/ui'
import ErrorCard from './ErrorCard'
import { useTranslation, Trans } from 'react-i18next'

const SUPPORT_URL = 'https://github.com/aragon/aragon/issues/new'

const GenericError = props => {
  const { t } = useTranslation()
  return (
    <ErrorCard
      title={t('Oops.')}
      supportUrl={SUPPORT_URL}
      showReloadButton
      {...props}
    >
      <Trans i18nKey="i-crash-description">
        Something went wrong and the application crashed. Reloading might solve
        the problem, or you can{' '}
        <SafeLink href={SUPPORT_URL}>create an issue</SafeLink> on GitHub so we
        can help.
      </Trans>
    </ErrorCard>
  )
}

export default GenericError
