import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Info, Text, SidePanelSeparator, theme } from '@aragon/ui'

import SignerButton from './SignerButton'
import ToggleContent from './ToggleContent'
import LocalIdentityBadge from '../IdentityBadge/LocalIdentityBadge'
import AppInstanceLabel from '../AppInstanceLabel'
import { AppType, EthereumAddressType } from '../../prop-types'
import { isHumanReadable } from '../../utils'

const SignMsgContent = ({ apps, account, intent, onSign, signingEnabled }) => {
  const locateAppInfo = (apps, requestingApp) =>
    apps.find(({ proxyAddress }) => proxyAddress === requestingApp)

  const humanReadableMessage = isHumanReadable(intent.message)
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <span css="margin-right: 4px">
        {t(
          'You are about to sign this message with the connected account {account}',
          { account: <LocalIdentityBadge entity={account} /> }
        )}
      </span>
      <Separator />
      <Label>{t('Signature requested by')}</Label>
      <AppInstanceLabel
        app={locateAppInfo(apps, intent.requestingApp)}
        proxyAddress={intent.requestingApp}
        showIcon
      />
      <Separator />
      {humanReadableMessage ? (
        <React.Fragment>
          <Label>{t('Message')}</Label>
          <Info>{intent.message}</Info>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <ToggleContent
            labelOpen={t('Hide message')}
            labelClosed={t('Show message')}
          >
            <React.Fragment>
              <LongMessage>{intent.message}</LongMessage>
            </React.Fragment>
          </ToggleContent>
        </React.Fragment>
      )}
      <SignerButton onClick={onSign} disabled={!signingEnabled}>
        {t('Sign message')}
      </SignerButton>
    </React.Fragment>
  )
}

SignMsgContent.propTypes = {
  account: EthereumAddressType.isRequired,
  apps: PropTypes.arrayOf(AppType).isRequired,
  intent: PropTypes.object.isRequired,
  onSign: PropTypes.func.isRequired,
  signingEnabled: PropTypes.bool,
}

const Separator = styled(SidePanelSeparator)`
  margin-top: 18px;
  margin-bottom: 18px;
`

const Label = styled(Text).attrs({
  smallcaps: true,
  color: theme.textSecondary,
})`
  display: block;
  margin-bottom: 10px;
`

const LongMessage = styled(Info)`
  margin-top: 10px;
  max-height: 350px;
  overflow-y: scroll;
  word-break: break-word;
`

export default SignMsgContent
