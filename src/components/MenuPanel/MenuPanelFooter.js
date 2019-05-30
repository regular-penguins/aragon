import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Button, IconSettings, Text, theme } from '@aragon/ui'
import { EthereumAddressType } from '../../prop-types'
import LocalIdentityBadge from '../../components/IdentityBadge/LocalIdentityBadge'

const MenuPanelFooter = ({
  account,
  connected,
  onOpenPreferences,
  onRequestEnable,
}) => {
  const { t } = useTranslation()
  return (
    <div css="margin: 15px 20px">
      <div>
        <ConnectionBullet connected={connected} />
        <Text size="xsmall">
          {connected ? t('Connected to the network') : t('Not connected')}
        </Text>
      </div>

      <div css="display: inline-grid">
        <ConnectedAccount account={account} onRequestEnable={onRequestEnable} />
        <PreferencesButton onClick={onOpenPreferences} />
      </div>
    </div>
  )
}

MenuPanelFooter.propTypes = {
  account: EthereumAddressType,
  connected: PropTypes.bool,
  onOpenPreferences: PropTypes.func.isRequired,
  onRequestEnable: PropTypes.func.isRequired,
}

const ConnectedAccount = ({ account, onRequestEnable }) => {
  const { t } = useTranslation()
  return (
    <div
      css={`
        overflow: hidden;
        margin-top: 12px;
        display: flex;
      `}
    >
      {account ? (
        <LocalIdentityBadge entity={account} />
      ) : (
        <Button
          size="small"
          mode="secondary"
          label={t('Preferences')}
          onClick={onRequestEnable}
          style={{ minWidth: '100%' }}
        >
          {t('Enable account')}
        </Button>
      )}
    </div>
  )
}

ConnectedAccount.propTypes = {
  account: EthereumAddressType,
  onRequestEnable: PropTypes.func.isRequired,
}

const PreferencesButton = ({ onClick }) => {
  const { t } = useTranslation()
  return (
    <div css="margin-top: 12px">
      <Button
        size="small"
        mode="outline"
        label={t('Preferences')}
        onClick={onClick}
        css="min-width: 100%"
      >
        <span
          css={`
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <IconSettings
            css={`
              flex-shrink: 0;
              margin: 0 6px 0 -3px;
            `}
          />
          <span>{t('Preferences')}</span>
        </span>
      </Button>
    </div>
  )
}
PreferencesButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}

const ConnectionBullet = styled.span`
  width: 8px;
  height: 8px;
  margin-top: -2px;
  margin-right: 8px;
  border-radius: 50%;
  display: inline-block;
  background: ${({ connected }) =>
    connected ? theme.positive : theme.negative};
`

export default MenuPanelFooter
