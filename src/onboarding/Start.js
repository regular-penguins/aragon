/* eslint react/prop-types: 0 */
import React from 'react'
import styled from 'styled-components'
import BN from 'bn.js'
import { withTranslation, Trans } from 'react-i18next'

import {
  Button,
  DropDown,
  IconAttention,
  IconCheck,
  IconCross,
  SafeLink,
  Text,
  TextInput,
  Viewport,
  breakpoint,
  theme,
} from '@aragon/ui'
import { animated } from 'react-spring'
import { network, getDemoDao, web3Providers } from '../environment'
import { sanitizeNetworkType } from '../network-config'
import providerString from '../provider-strings'
import { isElectron, noop } from '../utils'
import {
  fromWei,
  toWei,
  getUnknownBalance,
  formatBalance,
  isConnected,
} from '../web3-utils'
import LoadingRing from '../components/LoadingRing'
import logo from './assets/logo-welcome.svg'

import {
  DomainCheckNone,
  DomainCheckPending,
  DomainCheckAccepted,
  DomainCheckRejected,
} from './domain-states'

const MAINNET_RISKS_BLOG_POST =
  'https://blog.aragon.org/aragon-06-is-live-on-mainnet'

const MINIMUM_BALANCE = new BN(toWei('0.1'))
const BALANCE_DECIMALS = 3

const demoDao = getDemoDao()

class Start extends React.Component {
  static defaultProps = {
    walletNetwork: '',
    walletProviderId: '',
    balance: getUnknownBalance(),
    onCreate: noop,
    onDomainChange: noop,
    domain: '',
    domainCheckStatus: DomainCheckNone,
    onOpenOrganization: noop,
    onOpenOrganizationAddress: noop,
    onRequestEnable: noop,
  }
  handleDomainChange = event => {
    this.props.onDomainChange(event.target.value)
  }
  handleOpenOrganization = event => {
    event.preventDefault()
    this.props.onOpenOrganization()
  }
  render() {
    const {
      hasAccount,
      walletNetwork,
      walletProviderId,
      balance,
      onCreate,
      domain,
      domainCheckStatus,
      onOpenOrganizationAddress,
      selectorNetworks,
      onRequestEnable,
      screenTransitionStyles,
      t,
    } = this.props

    return (
      <Main style={{ opacity: screenTransitionStyles.opacity }}>
        <Viewport>
          {({ below }) => (
            <Content style={screenTransitionStyles}>
              {below('medium') && (
                <Warning>
                  <Trans i18nKey="i-use-desktop-browser">
                    If you want to <span>create</span> an organization, please
                    use your desktop browser.
                  </Trans>
                </Warning>
              )}
              <StartContent
                onCreate={onCreate}
                hasWallet={isConnected(web3Providers.wallet)}
                hasAccount={hasAccount}
                walletNetwork={walletNetwork}
                walletProviderId={walletProviderId}
                balance={balance}
                onDomainChange={this.handleDomainChange}
                domain={domain}
                domainCheckStatus={domainCheckStatus}
                onOpenOrganization={this.handleOpenOrganization}
                onOpenOrganizationAddress={onOpenOrganizationAddress}
                selectorNetworks={selectorNetworks}
                onRequestEnable={onRequestEnable}
                smallMode={below('medium')}
                t={t}
              />
            </Content>
          )}
        </Viewport>
      </Main>
    )
  }
}

class StartContent extends React.PureComponent {
  handleOpenDemoOrganization = () => {
    if (demoDao) {
      this.props.onOpenOrganizationAddress(demoDao)
    }
  }
  // Also returns false if the balance is unknown
  enoughBalance() {
    return this.props.balance.gte(MINIMUM_BALANCE)
  }
  unknownBalance() {
    return this.props.balance.eqn(-1)
  }
  formattedBalance() {
    const { balance } = this.props
    return this.unknownBalance()
      ? '0'
      : formatBalance(balance, {
          precision: BALANCE_DECIMALS,
        })
  }

  getNetworkChooserItems() {
    const { selectorNetworks } = this.props
    return [...selectorNetworks].sort(([id]) => (id === network.type ? -1 : 1))
  }

  handleNetworkChange = index => {
    const networkChooserItems = this.getNetworkChooserItems()
    const url = networkChooserItems[index][2]
    window.location = url
  }

  render() {
    const {
      hasWallet,
      hasAccount,
      walletNetwork,
      domain,
      domainCheckStatus,
      onDomainChange,
      onOpenOrganization,
      smallMode,
      t,
    } = this.props

    const canCreate =
      this.enoughBalance() &&
      hasWallet &&
      hasAccount &&
      walletNetwork === network.type

    const networkChooserItems = this.getNetworkChooserItems()

    return (
      <React.Fragment>
        <Title>
          <Text
            size={smallMode ? 'xxlarge' : 'great'}
            weight="bold"
            color={theme.textDimmed}
          >
            {smallMode
              ? t('Find an existing organization')
              : t('Welcome to Aragon')}
          </Text>
        </Title>

        <NetworkChooser>
          <p>
            <Text size="large" color={theme.textSecondary}>
              {smallMode
                ? t('Choose network')
                : t('Start by choosing the network for your organization')}
            </Text>
          </p>

          <NetworkChooserContainer>
            <div>
              <DropDown
                items={networkChooserItems.map(([id, label]) => label)}
                onChange={this.handleNetworkChange}
                wide={smallMode}
              />
            </div>

            {!smallMode && network.type === 'main' && (
              <Disclosure>
                <span>
                  <IconAttention />
                </span>
                <p>
                  <Trans i18nKey="i-warning-mainnet-real-funds">
                    Mainnet uses real funds.{' '}
                    <StrongSafeLink
                      href={MAINNET_RISKS_BLOG_POST}
                      target="_blank"
                    >
                      Find out more
                    </StrongSafeLink>{' '}
                    about the risks and what’s been done to mitigate them.
                  </Trans>
                </p>
              </Disclosure>
            )}
          </NetworkChooserContainer>
        </NetworkChooser>

        <TwoActions>
          {!smallMode && (
            <Action>
              <p>
                <Text size="large" color={theme.textSecondary}>
                  {t('Then create a new organization')}
                </Text>
              </p>
              <Button
                mode="strong"
                onClick={this.props.onCreate}
                disabled={!canCreate}
              >
                {t('Create a new organization')}
              </Button>
              {this.renderWarning()}
            </Action>
          )}
          <form onSubmit={onOpenOrganization}>
            <Action>
              <p>
                <Text size="large" color={theme.textSecondary}>
                  {smallMode
                    ? t('Enter an organization’s name')
                    : t('Or open an existing organization')}
                </Text>
              </p>

              <OpenOrganization>
                <Field>
                  <StyledTextInput
                    id="onboard-start-domain"
                    onChange={onDomainChange}
                    value={domain}
                    placeholder={t('Organization name')}
                  />
                  <label htmlFor="onboard-start-domain">
                    <Text weight="bold" sie={smallMode ? 'large' : 'normal'}>
                      {' '}
                      .aragonid.eth
                    </Text>
                  </label>
                  <Status>
                    <CheckContainer
                      active={domainCheckStatus === DomainCheckAccepted}
                    >
                      <IconCheck />
                    </CheckContainer>
                    <CheckContainer
                      active={domainCheckStatus === DomainCheckRejected}
                    >
                      <IconCross />
                    </CheckContainer>
                    <CheckContainer
                      active={domainCheckStatus === DomainCheckPending}
                    >
                      <LoadingRing
                        spin={
                          this.props.domainCheckStatus === DomainCheckPending
                        }
                      />
                    </CheckContainer>
                  </Status>
                </Field>

                <SubmitWrap>
                  {domainCheckStatus === DomainCheckAccepted && (
                    <StyledSubmitButton
                      mode={smallMode ? 'strong' : 'outline'}
                      compact={!smallMode}
                      onClick={onOpenOrganization}
                    >
                      {smallMode ? t('Next') : t('Open organization')}
                    </StyledSubmitButton>
                  )}
                  {domainCheckStatus === DomainCheckRejected && (
                    <DomainStatus size={smallMode ? 'large' : 'xsmall'}>
                      {t('No organization with that name exists.')}
                    </DomainStatus>
                  )}
                </SubmitWrap>
              </OpenOrganization>
            </Action>
          </form>
        </TwoActions>
        {demoDao && (
          <p>
            <Text size="normal" color={theme.textSecondary}>
              <Trans i18nKey="i-demo-organization">
                Not ready to create an organization? Try browsing this{' '}
                <ButtonLink onClick={this.handleOpenDemoOrganization}>
                  demo organization
                </ButtonLink>{' '}
                instead.
              </Trans>
            </Text>
          </p>
        )}
      </React.Fragment>
    )
  }
  renderWarning() {
    const {
      hasWallet,
      hasAccount,
      walletNetwork,
      walletProviderId,
      onRequestEnable,
      t,
    } = this.props
    if (!hasWallet) {
      return (
        <ActionInfo>
          {isElectron() ? (
            <React.Fragment>
              <Trans i18nKey="i-missing-provider-frame">
                Please install{' '}
                <SafeLink href="https://frame.sh/" target="_blank">
                  Frame
                </SafeLink>{' '}
                as your Ethereum provider
              </Trans>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Trans i18nKey="i-missing-provider">
                Please install an Ethereum provider (e.g.{' '}
                <SafeLink href="https://metamask.io/" target="_blank">
                  MetaMask
                </SafeLink>
                )
              </Trans>
            </React.Fragment>
          )}
          .
        </ActionInfo>
      )
    }
    if (!hasAccount) {
      const provider = providerString(
        t('your Ethereum provider'),
        walletProviderId
      ) // TODO check this
      return (
        <ActionInfo>
          <Trans i18nKey="i-unlock-enable">
            Please unlock and{' '}
            <ButtonLink onClick={onRequestEnable} style={{ color: '#000' }}>
              enable
            </ButtonLink>{' '}
            {{ provider }}.
          </Trans>
        </ActionInfo>
      )
    }
    if (network.type === 'unknown') {
      return (
        <ActionInfo>
          <Trans i18nKey="i-unsupported-network">
            This app was configured to connect to an unsupported network. Please
            change the network environment settings.
          </Trans>
        </ActionInfo>
      )
    }
    if (walletNetwork !== network.type) {
      return (
        <ActionInfo>
          {t('Please select the {networkType} network in {provider}.', {
            networkType: sanitizeNetworkType(network.type),
            provider: providerString(
              'your Ethereum provider',
              walletProviderId
            ),
          })}
        </ActionInfo>
      )
    }
    if (!this.enoughBalance()) {
      const minBalance = fromWei(String(MINIMUM_BALANCE))
      return (
        <ActionInfo>
          {t('You need at least {{minBalance}} ETH', { minBalance })}
          {this.unknownBalance()
            ? t(' (your account balance is unknown)')
            : t(` (you have {n} ETH)`, { n: this.formattedBalance() })}
          .<br />
          {network.type === 'rinkeby' && (
            <SafeLink target="_blank" href="https://faucet.rinkeby.io/">
              {t('Request Ether on the Rinkeby Network')}
            </SafeLink>
          )}
          {network.type === 'private' &&
            t('Please import an account with enough ETH.')}
        </ActionInfo>
      )
    }
    return null
  }
}

const DomainStatus = styled(Text)`
  display: block;
  margin-left: 5px;

  ${breakpoint(
    'medium',
    `
      margin: -10px 0 0 5px;
    `
  )}
`

const SubmitWrap = styled.span`
  height: 40px;
  display: flex;

  ${breakpoint(
    'medium',
    `
      display: inline;
    `
  )}
`

const StyledSubmitButton = styled(Button)`
  margin-left: auto;

  ${breakpoint(
    'medium',
    `
      margin-left: unset;
    `
  )}
`

const Warning = styled.div`
  background: rgba(255, 195, 70, 0.09);
  border-radius: 3px;
  padding: 13px;
  margin: 0 auto;
  margin-bottom: 45px;
  font-size: 15px;

  & span {
    font-weight: bold;
  }
`

const Main = styled(animated.div)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 24px;
  background: url(${logo}) no-repeat top center;
  background-size: calc(100vw - 32px);
  background-position: 50% 16.666666vh;

  ${breakpoint(
    'medium',
    `
      padding: 100px;
      background: none;
    `
  )}

  @media (min-width: 1180px) {
    justify-content: flex-start;
    background: url(${logo}) no-repeat calc(100% - 70px) 60%;
  }
`

const Content = styled(animated.div)`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  ${breakpoint(
    'medium',
    `
      justify-content: center;
    `
  )}
`

const TwoActions = styled.div`
  width: 100%;

  ${breakpoint(
    'medium',
    `
      display: flex;
      align-items: flex-start;
      > *:first-child {
        width: 400px;
      }
    `
  )}
`

const NetworkChooser = styled.div`
  width: 100%;
  margin-bottom: 45px;
  > p:first-child {
    margin-bottom: 20px;
  }

  ${breakpoint(
    'medium',
    `
      margin-bottom: 60px;
      > p:first-child {
        margin-bottom: 40px;
      }
    `
  )}
`

const NetworkChooserContainer = styled.div`
  display: block;

  ${breakpoint(
    'medium',
    `
      display: flex;
    `
  )}
`

const StrongSafeLink = styled(SafeLink)`
  text-decoration-color: ${theme.accent};
  color: ${theme.accent};
`

const Disclosure = styled.div`
  position: relative;
  max-width: 400px;
  margin-left: 50px;
  & > span:first-child {
    position: absolute;
    top: -2px;
    left: -25px;
  }
`

const Action = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  padding-bottom: 30px;
  padding-top: ${({ spaced }) => (spaced ? '50px' : '0')};
  p {
    margin-bottom: 20px;
  }
`

const ActionInfo = styled.span`
  position: relative;
  z-index: 2;
  height: 0;
  margin-top: 8px;
  font-size: 12px;
  white-space: nowrap;
`

const Title = styled.h1`
  font-size: 37px;
  margin-bottom: 45px;

  ${breakpoint(
    'medium',
    `
      margin-bottom: 40px;
    `
  )}
`

const OpenOrganization = styled.div`
  width: 100%;

  ${breakpoint(
    'medium',
    `
      display: flex;
      flex-direction: column;
    `
  )}
`

const StyledTextInput = styled(TextInput)`
  width: 100%;
  margin-bottom: 10px;

  ${breakpoint(
    'medium',
    `
      text-align: right;
      margin-bottom: 0;
    `
  )}
`

const Field = styled.div`
  margin-bottom: 20px;

  label {
    display: inline-block;
    margin: 0 4px 0 8px;
  }

  ${breakpoint(
    'medium',
    `
      display: flex;
      align-items: center;

      label {
        margin: 0 10px;
      }
    `
  )}
`

const Status = styled.span`
  position: relative;
  width: 20px;
  height: 20px;
`

const CheckContainer = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transform: scale(${({ active }) => (active ? '1, 1' : '0, 0')});
  transform-origin: 50% 50%;
  transition: transform 100ms ease-in-out;
`

const ButtonLink = styled.button.attrs({ type: 'button' })`
  padding: 0;
  font-size: inherit;
  text-decoration: underline;
  color: ${theme.accent};
  cursor: pointer;
  background: none;
  border: 0;
`

export default withTranslation()(Start)
