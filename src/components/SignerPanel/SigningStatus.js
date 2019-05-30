import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Info, theme } from '@aragon/ui'
import providerString from '../../provider-strings'
import SignerButton from './SignerButton'

import {
  STATUS_TX_ERROR,
  STATUS_TX_SIGNED,
  STATUS_TX_SIGNING,
  SignerStatusType,
  STATUS_MSG_SIGNING,
  STATUS_MSG_SIGNED,
  STATUS_MSG_ERROR,
  isSignatureSuccess,
  isSignatureError,
  isSigning,
  isSignatureCompleted,
} from './signer-statuses'

import imgPending from '../../assets/transaction-pending.svg'
import imgSuccess from '../../assets/transaction-success.svg'
import imgError from '../../assets/transaction-error.svg'

// Temporarily clean the error messages coming from Aragon.js and Metamask
const cleanErrorMessage = errorMsg =>
  errorMsg
    // Only use the first line if multiple lines are available.
    // This makes sure we don't show the stack trace if it becomes part of the message.
    .split('\n')[0]
    .replace(/^Returned error: /, '')
    .replace(/^Error: /, '')

class SigningStatus extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    status: SignerStatusType.isRequired,
    signError: PropTypes.instanceOf(Error),
    walletProviderId: PropTypes.string,
    t: PropTypes.func.isRequired,
  }
  getLabel() {
    const { status, t } = this.props
    if (isSigning(status)) return t('Waiting for signature…')
    if (status === STATUS_TX_SIGNED) return t('Transaction signed!')
    if (status === STATUS_MSG_SIGNED) return t('Message signed!')
    if (status === STATUS_TX_ERROR) return t('Error signing the transaction.')
    if (status === STATUS_MSG_ERROR) return t('Error signing the message.')
  }
  getInfo() {
    const { status, signError, walletProviderId, t } = this.props
    if (status === STATUS_TX_SIGNING) {
      return (
        <p>
          {t(`Open {provider} to sign your transaction.`, {
            provider: providerString(
              t('your Ethereum provider'),
              walletProviderId
            ),
          })}
        </p>
      )
    }
    if (status === STATUS_MSG_SIGNING) {
      return (
        <p>
          {t(`Open {provider} to sign your message.`, {
            provider: providerString(
              t('your Ethereum provider'),
              walletProviderId
            ),
          })}
        </p>
      )
    }
    if (status === STATUS_TX_SIGNED) {
      return (
        <p>
          {t(
            'Success! Your transaction has been sent to the network for processing.'
          )}
        </p>
      )
    }
    if (status === STATUS_MSG_SIGNED) {
      return <p>{t('Success! Your message has been signed.')}</p>
    }
    if (status === STATUS_TX_ERROR) {
      return (
        <React.Fragment>
          <p>{t(`Your transaction wasn't signed and no tokens were sent.`)}</p>
          {signError && (
            <p>
              {t(`Error: {error}“`, {
                error: cleanErrorMessage(signError.message),
              })}
            </p>
          )}
        </React.Fragment>
      )
    }
    if (status === STATUS_MSG_ERROR) {
      return (
        <React.Fragment>
          <p>{t(`Your message wasn't signed.`)}</p>
          {signError && (
            <p>
              {t(`Error: {error}“`, {
                error: cleanErrorMessage(signError.message),
              })}
            </p>
          )}
        </React.Fragment>
      )
    }
  }
  getCloseButton() {
    const { status, onClose, t } = this.props
    if (isSignatureCompleted(status)) {
      return <SignerButton onClick={onClose}>{t('Close')}</SignerButton>
    }
    return null
  }
  render() {
    const { status } = this.props
    return (
      <React.Fragment>
        <Status>
          <StatusImage status={status} />
          <p>{this.getLabel()}</p>
        </Status>
        <AdditionalInfo>{this.getInfo()}</AdditionalInfo>
        {this.getCloseButton()}
      </React.Fragment>
    )
  }
}

const Status = styled.div`
  margin-top: 80px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${theme.textSecondary};
  img {
    margin-bottom: 20px;
  }
`

const AdditionalInfo = styled(Info)`
  p + p {
    margin-top: 10px;
  }
`

// To skip the SVG rendering delay
const StatusImage = ({ status }) => (
  <StatusImageMain>
    <StatusImageImg visible={isSigning(status)} src={imgPending} />
    <StatusImageImg visible={isSignatureError(status)} src={imgError} />
    <StatusImageImg visible={isSignatureSuccess(status)} src={imgSuccess} />
  </StatusImageMain>
)
StatusImage.propTypes = {
  status: SignerStatusType.isRequired,
}

const StatusImageMain = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
`
const StatusImageImg = styled.img.attrs({ alt: '' })`
  opacity: ${p => Number(p.visible)};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  max-height: 100%;
`

export default SigningStatus
