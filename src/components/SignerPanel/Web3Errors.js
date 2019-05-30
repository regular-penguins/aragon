import React from 'react'
import PropTypes from 'prop-types'
import { Info, SafeLink, theme } from '@aragon/ui'
import styled from 'styled-components'
import { useTranslation, Trans } from 'react-i18next'

import AddressLink from './AddressLink'
import SignerButton from './SignerButton'
import providerString from '../../provider-strings'
import { isElectron } from '../../utils'

const Web3ProviderError = ({
  intent: { description, name, to },
  onClose,
  neededText,
  actionText,
}) => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <Info.Action title={t(`You can't perform any action`)}>
        {neededText} in order to perform{' '}
        {description ? `“${description}”` : 'this action'}
        {name && (
          <React.Fragment>
            on <AddressLink to={to}>{name}</AddressLink>
          </React.Fragment>
        )}
        .<p css="margin-top: 15px">{actionText}</p>
      </Info.Action>
      <SignerButton onClick={onClose}>{t('Close')}</SignerButton>
    </React.Fragment>
  )
}

Web3ProviderError.propTypes = {
  actionText: PropTypes.node.isRequired,
  intent: PropTypes.object.isRequired,
  neededText: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
}

export const NoWeb3Provider = ({ intent, onClose }) => {
  const { t } = useTranslation()
  const onElectron = isElectron()
  const neededText = onElectron
    ? t('You need to have Frame installed and enabled')
    : t('You need to have an Ethereum provider installed and enabled')

  const actionText = (
    <span>
      {t('Please install and enable {provider}.', {
        provider: (
          <SafeLink
            href={onElectron ? 'https://frame.sh/' : 'https://metamask.io/'}
            target="_blank"
          >
            {onElectron ? 'Frame' : 'Metamask'}
          </SafeLink>
        ),
      })}
    </span>
  )

  return (
    <Web3ProviderError
      intent={intent}
      onClose={onClose}
      neededText={neededText}
      actionText={actionText}
    />
  )
}

NoWeb3Provider.propTypes = {
  intent: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
}

export const AccountLocked = ({
  intent,
  onClose,
  onRequestEnable,
  walletProviderId,
}) => {
  const { t } = useTranslation()
  const provider = providerString(t('your Ethereum provider'), walletProviderId)
  return (
    <Web3ProviderError
      intent={intent}
      onClose={onClose}
      neededText={t(`You need to unlock and enable {providerMessage}`, {
        providerMessage: provider,
      })}
      actionText={
        <span>
          <Trans i18nKey="i-unlock-enable">
            Please unlock and{' '}
            <ButtonLink onClick={onRequestEnable}>enable</ButtonLink>{' '}
            {{ provider }}.
          </Trans>
        </span>
      }
    />
  )
}

AccountLocked.propTypes = {
  intent: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onRequestEnable: PropTypes.func.isRequired,
  walletProviderId: PropTypes.string.isRequired,
}

const ButtonLink = styled.button.attrs({ type: 'button' })`
  padding: 0;
  font-size: inherit;
  text-decoration: underline;
  color: ${theme.textPrimary};
  cursor: pointer;
  background: none;
  border: 0;
`

export const WrongNetwork = ({
  intent,
  networkType,
  onClose,
  walletProviderId,
}) => {
  const { t } = useTranslation()
  return (
    <Web3ProviderError
      intent={intent}
      onClose={onClose}
      neededText={t(`You need to be connected to the {networkType} network`, {
        networkType,
      })}
      actionText={t(`Please connect {provider} to the {networkType} network.`, {
        provider: providerString(t('your Ethereum provider'), walletProviderId),
        networkType,
      })}
    />
  )
}

WrongNetwork.propTypes = {
  intent: PropTypes.object.isRequired,
  networkType: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  walletProviderId: PropTypes.string.isRequired,
}
