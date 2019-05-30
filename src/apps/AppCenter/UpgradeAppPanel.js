import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  Button,
  Info,
  SafeLink,
  SidePanel,
  SidePanelSeparator,
  SidePanelSplit,
} from '@aragon/ui'
import { RepoType } from '../../prop-types'
import { TextLabel } from '../../components/TextStyles'
import { GU } from '../../utils'
import { withTranslation, Trans } from 'react-i18next'

class UpgradeAppPanel extends React.PureComponent {
  static propTypes = {
    repo: RepoType,
    onClose: PropTypes.func.isRequired,
    onUpgrade: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }
  state = {
    repo: null,
  }
  static getDerivedStateFromProps(props, state) {
    // `repo` is saved in the state, so that the selected app
    // can still be visible while the panel is being closed.
    if (props.repo !== state.repo && props.repo) {
      return { repo: props.repo }
    }
    return {}
  }
  handleUpgradeClick = () => {
    const {
      repo: { appId, versions },
      onUpgrade,
    } = this.props
    const { contractAddress } = versions[versions.length - 1]
    onUpgrade(appId, contractAddress)
  }
  render() {
    const { repo } = this.state
    const { repo: propsRepo, onClose, t } = this.props

    if (!repo) {
      return null
    }

    const { currentVersion, latestVersion } = repo
    const {
      name,
      changelog_url: changelogUrl,
      source_url: sourceUrl,
    } = repo.latestVersion.content

    return (
      <SidePanel
        title={name ? t(`Upgrade “{name}“`, { name }) : t(`Upgrade “Unknown”`)}
        opened={Boolean(propsRepo)}
        onClose={onClose}
      >
        <SidePanelSplit>
          <div>
            <Heading2>{t('Current version')}</Heading2>
            <div>{currentVersion.version}</div>
          </div>
          <div>
            <Heading2>{t('New version')}</Heading2>
            <div>{latestVersion.version}</div>
          </div>
        </SidePanelSplit>

        <Part>
          <Heading2>{t('Changelog')}</Heading2>
          <p>
            {changelogUrl ? (
              <SafeLink href={changelogUrl} target="_blank">
                {changelogUrl}
              </SafeLink>
            ) : (
              t('There is no changelog for this version.')
            )}
          </p>

          <Heading2>{t('Source code')}</Heading2>
          <p>
            {sourceUrl ? (
              <SafeLink href={sourceUrl} target="_blank">
                {sourceUrl}
              </SafeLink>
            ) : (
              t('There is no available source for this app.')
            )}
          </p>
        </Part>

        <SidePanelSeparator />
        <Part>
          <Heading2>{t('Permissions')}</Heading2>
          <p>{t('This upgrade doesn’t introduce any new permissions.')}</p>
        </Part>

        <SidePanelSeparator />

        <Part>
          <div
            css={`
              margin: ${4 * GU}px 0 ${2 * GU}px;
            `}
          >
            <Button mode="strong" wide onClick={this.handleUpgradeClick}>
              {t('Upgrade')}
            </Button>
          </div>

          <Info.Action>
            <Trans i18nKey="i-apps-will-be-upgraded">
              All the “{{ name }}” app instances installed on your organization
              be upgraded.
            </Trans>
          </Info.Action>
        </Part>
      </SidePanel>
    )
  }
}

const Heading2 = styled(TextLabel).attrs({ as: 'h2' })`
  white-space: nowrap;
`

const Part = styled.div`
  padding: ${GU}px 0 ${3 * GU}px;
  h2 {
    margin: ${2 * GU}px 0 ${GU}px;
  }
`

export default withTranslation()(UpgradeAppPanel)
