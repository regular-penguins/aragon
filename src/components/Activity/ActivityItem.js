import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  ButtonIcon,
  IconClose,
  IconError,
  SafeLink,
  blockExplorerUrl,
  theme,
} from '@aragon/ui'
import { withTranslation } from 'react-i18next'
import { network } from '../../environment'
import { cssgu } from '../../utils'
import { transformAddresses } from '../../web3-utils'
import AppIcon from '../AppIcon/AppIcon'
import LocalIdentityBadge from '../../components/IdentityBadge/LocalIdentityBadge'
import IconSuccess from '../../icons/IconSuccess'
import IconPending from '../../icons/IconPending'
import TimeTag from './TimeTag'
import TransactionProgress from './TransactionProgress'
import {
  ACTIVITY_STATUS_CONFIRMED,
  ACTIVITY_STATUS_FAILED,
  ACTIVITY_STATUS_TIMED_OUT,
} from '../../symbols'

const ActivityItem = ({ activity, onDiscard, t }) => {
  const { app } = activity

  const handleClose = useCallback(() => {
    onDiscard(activity)
  }, [onDiscard, activity])

  return (
    <section
      css={`
        display: grid;
        align-items: center;
        grid-template-areas:
          'title time'
          'content content';
        overflow: hidden;
        position: relative;
        width: 100%;
        padding: ${cssgu`3gu`};
        transition: background 0.5s;
        background: rgba(255, 255, 255, ${activity.read ? '0' : '0.6'});
        border-bottom: 1px solid ${theme.contentBorder};
      `}
    >
      <CloseButton onClick={handleClose} t={t} />
      <h1
        css={`
          grid-area: title;
          display: flex;
          align-items: center;
        `}
      >
        <div css="flex-shrink: 0">
          <AppIcon app={app} />
        </div>
        <div
          css={`
            margin-left: ${cssgu`1gu`};
            font-weight: 600;
            font-size: 16px;
            white-space: nowrap;
            color: ${theme.textPrimary};
          `}
        >
          {app ? app.name : t('Unknown')}
        </div>
      </h1>
      <div
        css={`
          grid-area: time;
          justify-self: end;
        `}
      >
        <TimeTag date={activity.createdAt} />
      </div>
      <div
        css={`
          grid-area: content;
          overflow: hidden;
          position: relative;
          margin: 10px 0 0;
          font-size: 15px;
        `}
      >
        <ItemContent text={activity.description} />
        <StatusMessage activity={activity} />
        <TransactionProgress
          status={activity.status}
          createdAt={activity.createdAt}
        />
      </div>
    </section>
  )
}

ActivityItem.propTypes = {
  activity: PropTypes.object.isRequired,
  onDiscard: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

const ItemContent = React.memo(
  ({ text = '' }) => (
    <p>
      {transformAddresses(text, (part, isAddress, index) =>
        isAddress ? (
          <span title={part} key={index}>
            <LocalIdentityBadge entity={part} compact />
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </p>
  ),
  (prevProps, nextProps) => prevProps.text === nextProps.text
)

ItemContent.propTypes = {
  text: PropTypes.string.isRequired,
}

function getStatusData(activity) {
  const { t } = this.props
  const txLink = (
    <SafeLink
      target="_blank"
      href={blockExplorerUrl('transaction', activity.transactionHash, {
        networkType: network.type,
      })}
    >
      {t('Transaction')}
    </SafeLink>
  )
  if (activity.status === ACTIVITY_STATUS_CONFIRMED) {
    return [
      <IconSuccess />,
      <span>{t('{txLink} confirmed.', { txLink })}</span>,
    ]
  }
  if (activity.status === ACTIVITY_STATUS_FAILED) {
    return [<IconError />, <span>{t('{txLink} failed.', { txLink })}</span>]
  }
  if (activity.status === ACTIVITY_STATUS_TIMED_OUT) {
    return [<IconError />, <span>{t('{txLink} timed out.', { txLink })}</span>]
  }
  return [<IconPending />, <span>{t('{txLink} pending.', { txLink })}</span>]
}

const StatusMessage = ({ activity }) => {
  const [icon, content] = getStatusData(activity)
  return (
    <div
      css={`
        display: flex;
        align-items: center;
        margin-top: 10px;
        font-size: 14px;
        a {
          color: ${theme.accent};
        }
      `}
    >
      {icon} <div css="margin-left: 5px">{content}</div>
    </div>
  )
}

StatusMessage.propTypes = {
  activity: PropTypes.object.isRequired,
}

const CloseButton = ({ t, ...props }) => (
  <ButtonIcon
    {...props}
    label={t('Close')}
    css={`
      position: absolute;
      top: 0;
      right: 0;
    `}
  >
    <IconClose />
  </ButtonIcon>
)

CloseButton.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withTranslation()(ActivityItem)
