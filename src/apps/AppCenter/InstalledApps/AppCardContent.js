import React from 'react'
import PropTypes from 'prop-types'
import color from 'onecolor'
import { Badge, Button, font, theme } from '@aragon/ui'
import AppIcon from '../../../components/AppIcon/AppIcon'
import { RepoType } from '../../../prop-types'
import { withTranslation } from 'react-i18next'

const AppCardContent = ({ repo, onOpen, t }) => {
  const { name, repoName, baseUrl, currentVersion, latestVersion } = repo
  const { description, icons } = latestVersion.content
  const canUpgrade = currentVersion.version !== latestVersion.version
  return (
    <section
      css={`
        display: flex;
        flex-direction: column;
        height: 100%;
        padding-top: 24px;
        justify-content: space-between;
      `}
    >
      <div
        css={`
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-grow: 2;
          margin-bottom: 20px;
        `}
      >
        <AppIcon app={{ baseUrl, icons }} size={56} css="margin: 0 0 20px" />
        <h1
          css={`
            text-align: center;
            margin-bottom: 8px;
            ${font({ size: 'large', weight: 'bold' })};
          `}
        >
          {name}
        </h1>
        {canUpgrade && (
          <div
            css={`
              display: flex;
              justify-content: center;
              margin-bottom: 12px;
            `}
          >
            <Badge
              background={color(theme.positive)
                .alpha(0.15)
                .cssa()}
              foreground={theme.positive}
            >
              {t('New version available')}
            </Badge>
          </div>
        )}
        <p
          css={`
            margin-bottom: 8px;
            text-align: center;
          `}
        >
          {description}
        </p>
      </div>
      <div>
        <Button
          mode={canUpgrade ? 'strong' : 'outline'}
          onClick={() => onOpen(repoName)}
          wide
        >
          {canUpgrade ? t('Upgrade') : t('View details')}
        </Button>
      </div>
    </section>
  )
}

AppCardContent.propTypes = {
  repo: RepoType.isRequired,
  onOpen: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(AppCardContent)
