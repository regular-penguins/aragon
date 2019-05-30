import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button, Text, useViewport, theme } from '@aragon/ui'
import LocalIdentityBadge from '../../components/IdentityBadge/LocalIdentityBadge'
import { appIds, network } from '../../environment'
import { sanitizeNetworkType } from '../../network-config'
import { AppType, DaoAddressType, EthereumAddressType } from '../../prop-types'
import { toChecksumAddress } from '../../web3-utils'
import airdrop, { testTokensEnabled } from '../../testnet/airdrop'
import Option from './Option'
import Note from './Note'
import { withTranslation, Trans } from 'react-i18next'

const AppsList = styled.ul`
  list-style: none;
`

const DaoSettings = React.memo(
  ({
    account,
    apps,
    appsLoading,
    daoAddress,
    onOpenApp,
    walletNetwork,
    walletWeb3,
    t,
  }) => {
    const handleDepositTestTokens = () => {
      const finance = apps.find(app => app.appId === appIds.Finance)
      if (finance && finance.proxyAddress) {
        airdrop(walletWeb3, finance.proxyAddress, account)
      }
    }
    const handleOpenFinance = () => {
      const finance = apps.find(app => app.appId === appIds.Finance)
      if (finance && finance.proxyAddress) {
        onOpenApp(finance.proxyAddress)
      }
    }
    const enableTransactions = !!account && walletNetwork === network.type
    const financeApp = apps.find(({ name }) => name === 'Finance')
    const checksummedDaoAddr =
      daoAddress.address && toChecksumAddress(daoAddress.address)
    const apmApps = apps.filter(app => !app.isAragonOsInternalApp)
    const { below } = useViewport()
    const shortAddresses = below('medium')

    return (
      <div>
        <Option
          name={t('Organization address')}
          text={t(`This organization is deployed on the {network}.`, {
            network: network.name,
          })}
        >
          {checksummedDaoAddr ? (
            <div>
              <Label>{t('Address')}</Label>
              <LocalIdentityBadge
                entity={checksummedDaoAddr}
                shorten={shortAddresses}
              />
            </div>
          ) : (
            <p>{t('Resolving DAO address…')}</p>
          )}
          <Note>
            <strong>{t('Do not send ether or tokens to this address!')}</strong>
            <br />
            {t(
              'Go to the {financeAppButton} to deposit funds into your organization instead.',
              {
                financeAppButton: financeApp ? (
                  <ButtonLink onClick={handleOpenFinance}>
                    {t('Finance app')}
                  </ButtonLink>
                ) : (
                  t('Finance app')
                ),
              }
            )}
          </Note>
        </Option>
        {testTokensEnabled(network.type) && (
          <Option
            name={t('Request test tokens')}
            text={t(
              `Deposit some tokens into your organization for testing purposes.`
            )}
          >
            <div>
              <Button
                mode="secondary"
                onClick={handleDepositTestTokens}
                disabled={!enableTransactions}
                style={{ opacity: enableTransactions ? 1 : 0.6 }}
              >
                {t('Request test tokens')}
              </Button>
              {!enableTransactions && (
                <Text size="small" style={{ marginLeft: '10px' }}>
                  {(() =>
                    walletNetwork !== network.type
                      ? t(
                          `Please select the {network} network in your Ethereum provider.`,
                          { network: sanitizeNetworkType(network.type) }
                        )
                      : t(
                          `Please unlock your account in your Ethereum provider.`
                        ))()}
                </Text>
              )}
            </div>
            <Note>
              <Trans i18nKey="i-token-request">
                Requesting tokens will assign random <strong>TEST</strong>{' '}
                tokens to your organization. The tokens are named after existing
                projects, but keep in mind <strong>THEY ARE NOT</strong> the
                real ones. You can view the received tokens in the Token
                Balances on the Finance app.
              </Trans>
            </Note>
          </Option>
        )}
        {appsLoading && (
          <Option name={t('Aragon apps')} text={t('Loading apps…')}>
            <div css={'height:20px'} />
          </Option>
        )}
        {apmApps.length > 0 && (
          <Option
            name={t('Aragon apps')}
            text={
              appsLoading
                ? t('Loading apps…')
                : t('x-settings-installed-apps', { count: apmApps.length })
            }
          >
            {!appsLoading && (
              <AppsList>
                {apmApps.map(
                  ({ appId, description, name, proxyAddress, tags }) => {
                    const checksummedProxyAddress = toChecksumAddress(
                      proxyAddress
                    )

                    return (
                      <AppItem
                        title={description}
                        key={checksummedProxyAddress}
                      >
                        <Label>
                          {name}
                          {tags.length > 0 ? ` (${tags.join(', ')})` : ''}
                        </Label>
                        <LocalIdentityBadge
                          entity={checksummedProxyAddress}
                          shorten={shortAddresses}
                        />
                      </AppItem>
                    )
                  }
                )}
              </AppsList>
            )}
          </Option>
        )}
      </div>
    )
  }
)

DaoSettings.propTypes = {
  account: EthereumAddressType,
  apps: PropTypes.arrayOf(AppType).isRequired,
  appsLoading: PropTypes.bool.isRequired,
  daoAddress: DaoAddressType.isRequired,
  onOpenApp: PropTypes.func.isRequired,
  walletNetwork: PropTypes.string.isRequired,
  walletWeb3: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
}

DaoSettings.defaultProps = {
  shortAddresses: false,
}

const ButtonLink = styled(Button).attrs({ mode: 'text' })`
  padding: 0;
  color: inherit;
  font-size: inherit;
  text-decoration: underline;
  transition: none;
  &:focus {
    outline: 2px solid ${theme.accent};
  }
  &:active {
    outline: 0;
  }
`

const Label = styled.label`
  display: block;
  color: ${theme.textSecondary};
  font-size: 11px;
  text-transform: uppercase;
`

const AppItem = styled.li`
  margin-bottom: 24px;
`

export default withTranslation()(DaoSettings)
