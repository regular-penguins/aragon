import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Info, RadioList, SafeLink } from '@aragon/ui'
import SignerButton from './SignerButton'
import AddressLink from './AddressLink'
import LocalIdentityBadge from '../IdentityBadge/LocalIdentityBadge'
import providerString from '../../provider-strings'
import { getAppPath } from '../../routing'

const RADIO_ITEM_TITLE_LENGTH = 30

class ActionPathsContent extends React.Component {
  static propTypes = {
    direct: PropTypes.bool.isRequired,
    intent: PropTypes.object.isRequired,
    dao: PropTypes.string.isRequired,
    onSign: PropTypes.func.isRequired,
    paths: PropTypes.array.isRequired,
    pretransaction: PropTypes.object,
    signingEnabled: PropTypes.bool,
    walletProviderId: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
  }
  state = {
    selected: 0,
  }
  handleChange = selected => {
    this.setState({ selected })
  }
  handleSign = () => {
    const { intent, direct, paths, pretransaction, onSign } = this.props
    const { selected } = this.state
    // In non-direct paths, the first transaction (0) is the one we need to sign
    // to kick off the forwarding path
    onSign(
      direct ? intent.transaction : paths[selected][0],
      intent,
      pretransaction
    )
  }
  renderDescription(
    showPaths,
    { description, name, to, annotatedDescription }
  ) {
    const { dao } = this.props
    return (
      <React.Fragment>
        <p>This transaction will {showPaths ? 'eventually' : ''} perform</p>
        <div
          css={`
            margin: 10px 0 10px 15px;
            line-height: 1.6;
          `}
        >
          {annotatedDescription
            ? annotatedDescription.map(({ type, value }, index) => {
                if (type === 'address' || type === 'any-account') {
                  return (
                    <span
                      key={index}
                      css={`
                        display: inline-flex;
                        vertical-align: middle;
                        margin-right: 4px;
                        position: relative;
                        top: -1px;
                      `}
                    >
                      <LocalIdentityBadge
                        entity={type === 'any-account' ? 'Any account' : value}
                        fontSize="small"
                        compact
                      />
                    </span>
                  )
                }
                if (type === 'app') {
                  return (
                    <SafeLink
                      key={index}
                      href={`#${getAppPath({
                        dao,
                        instanceId: 'permissions',
                        params: `app.${value.proxyAddress}`,
                      })}`}
                      target="_blank"
                      css="margin-right: 2px"
                    >
                      {value.name}
                    </SafeLink>
                  )
                }
                if (type === 'role' || type === 'kernelNamespace') {
                  return (
                    <span
                      key={index}
                      css={`
                        margin-right: 4px;
                        font-style: italic;
                      `}
                    >
                      {value.name}
                    </span>
                  )
                }
                if (type === 'apmPackage') {
                  return (
                    <span
                      key={index}
                      css={`
                        display: inline-flex;
                        vertical-align: middle;
                        margin-right: 4px;
                      `}
                    >
                      <LocalIdentityBadge
                        entity={value.name}
                        fontSize="small"
                      />
                    </span>
                  )
                }
                return (
                  <span key={index} css="margin-right: 4px">
                    {value}
                  </span>
                )
              })
            : description || 'an action'}
        </div>
        <p>
          {' on '}
          <AddressLink to={to}>{name}</AddressLink>.
        </p>
      </React.Fragment>
    )
  }
  getPathRadioItem(path) {
    // Slice off the intention (last transaction in the path)
    path = path.slice(0, path.length - 1)

    const titleElements = path.reduce((titleElements, { name }, index) => {
      const shortName =
        name.length > RADIO_ITEM_TITLE_LENGTH
          ? name.slice(0, RADIO_ITEM_TITLE_LENGTH) + '…'
          : name

      if (titleElements.length) {
        titleElements.push(' → ')
      }
      titleElements.push(
        <span key={index} title={name}>
          {shortName}
        </span>
      )
      return titleElements
    }, [])
    const title = <React.Fragment>{titleElements}</React.Fragment>

    const descriptionElements =
      path.length === 1
        ? path[0].description
        : path.map(({ name, description }, index) => (
            <p key={index}>
              {index + 1}. {name}: {description}
            </p>
          ))
    const description = <React.Fragment>{descriptionElements}</React.Fragment>

    return {
      description,
      title,
    }
  }
  render() {
    const {
      intent,
      direct,
      paths,
      pretransaction,
      signingEnabled,
      walletProviderId,
      t,
    } = this.props
    const { selected } = this.state
    const showPaths = !direct
    const radioItems = paths.map(this.getPathRadioItem)
    return (
      <React.Fragment>
        {showPaths ? (
          <div css="margin-bottom: 40px">
            <Info.Permissions title={t('Permission note:')}>
              {t(
                'You cannot directly perform this action. You do not have the necessary permissions.'
              )}
            </Info.Permissions>
            <div css="margin-top: 25px">
              <RadioList
                title={t('Action Requirement')}
                description={
                  paths.length > 1
                    ? t('Here are some options you can use to perform it:')
                    : t('You can perform this action through:')
                }
                items={radioItems}
                onChange={this.handleChange}
                selected={selected}
              />
            </div>
          </div>
        ) : (
          <h2 css="margin-bottom: 10px">
            {t('You can directly perform this action:')}
          </h2>
        )}
        <Info.Action icon={null} title={t('Action to be triggered')}>
          {this.renderDescription(showPaths, intent)}
        </Info.Action>
        {pretransaction && (
          <div css="margin-top: 20px">
            <Info.Action title={t('Two transactions required')}>
              {t(
                'This action requires two transactions to be signed in {provider}, please confirm them one after another.',
                {
                  provider: providerString(
                    t('your Ethereum provider'),
                    walletProviderId
                  ),
                }
              )}
            </Info.Action>
          </div>
        )}
        <SignerButton onClick={this.handleSign} disabled={!signingEnabled}>
          {t('Create transaction')}
        </SignerButton>
      </React.Fragment>
    )
  }
}

export default withTranslation()(ActionPathsContent)
