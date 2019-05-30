import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  Card,
  Badge,
  Text,
  SafeLink,
  theme,
  colors,
  unselectable,
  breakpoint,
} from '@aragon/ui'
import { appsInDevelopment } from './discover-apps-data'
import AppIcon from '../../../components/AppIcon/AppIcon'
import { withTranslation, Trans } from 'react-i18next'

const statusesLabels = {
  'pre-alpha': t => t('pre-alpha'),
  alpha: t => t('alpha'),
  experimental: t => t('experimental'),
  ready: t => t('ready'),
}

const statusesColors = {
  'pre-alpha': colors.Gold.Brandy,
  alpha: colors.Blue.Danube,
  experimental: colors.Blue.Danube,
  ready: colors.Green['Spring Green'],
}

const DiscoverApps = React.memo(({ t }) => (
  <div>
    <Trans i18nKey="i-new-apps">
      <p>
        You will soon be able to <em>browse</em> and <em>install</em> new apps
        into your Aragon organization from here.
      </p>
      <p>
        In the meantime, you can{' '}
        <SafeLink href="https://hack.aragon.org/" target="_blank">
          learn how to create apps
        </SafeLink>{' '}
        or preview some of the apps being developed.
      </p>
    </Trans>

    <h1
      css={`
        margin: 30px 0;
        font-weight: 600;
      `}
    >
      {t('Apps in development')}
    </h1>
    <AppsGrid>
      {appsInDevelopment.map((app, i) => (
        <Main key={i}>
          <Icon>
            <AppIcon size={64} src={app.icon} />
          </Icon>
          <Name>{app.name}</Name>
          <TagWrapper>
            <Tag background={statusesColors[app.status]}>
              {statusesLabels[app.status](t)}
            </Tag>
          </TagWrapper>
          <Description color={theme.textSecondary}>
            {app.description}
          </Description>
          <Action href={app.link} target="_blank">
            <Text weight="bold" color={theme.textSecondary}>
              {t('Learn more')}
            </Text>
          </Action>
        </Main>
      ))}
    </AppsGrid>
  </div>
))

DiscoverApps.propTypes = {
  t: PropTypes.func.isRequired,
}

const AppsGrid = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 25px;
  justify-items: start;
  grid-template-columns: 1fr;
  ${breakpoint(
    'medium',
    `
      grid-template-columns: repeat(auto-fill, 224px);
    `
  )};
`

const Main = styled(Card).attrs({ width: '100%', height: '288px' })`
  ${unselectable};
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 25px;
`

const Icon = styled.div`
  height: 64px;
  margin-bottom: 5px;
  img {
    display: block;
  }
`

const Name = styled.p`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 10px;
`

const TagWrapper = styled.div`
  max-width: 100%;
  padding: 0 20px;
  margin-bottom: 10px;
`

const Tag = styled(Badge)`
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  color: white;
`

const Description = styled(Text)`
  padding: 0 1rem;
  margin-bottom: 30px;
  text-align: center;
`

const Action = styled(SafeLink)`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding-bottom: 30px;
  text-align: center;
  text-decoration: none;
`

export default withTranslation()(DiscoverApps)
