import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { withTranslation } from 'react-i18next'
import { breakpoint } from '@aragon/ui'
import { AppType } from '../../../prop-types'
import Section from '../Section'
import AppCard from '../AppCard'
import EmptyBlock from '../EmptyBlock'

class BrowseByApp extends React.Component {
  static propTypes = {
    apps: PropTypes.arrayOf(AppType).isRequired,
    loading: PropTypes.bool.isRequired,
    onOpenApp: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  render() {
    const { loading, apps, onOpenApp, t } = this.props
    return (
      <Section title={t('Browse by app')}>
        {(() => {
          if (loading) {
            return <EmptyBlock>{t('Loading apps…')}</EmptyBlock>
          }
          if (apps.length === 0) {
            return <EmptyBlock>{t('No apps installed.')}</EmptyBlock>
          }
          return (
            <Apps>
              {apps.map(app => (
                <AppCard key={app.proxyAddress} app={app} onOpen={onOpenApp} />
              ))}
            </Apps>
          )
        })()}
      </Section>
    )
  }
}

const Apps = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: minmax(150px, 1fr) minmax(150px, 1fr);
  margin: 0 20px;

  ${breakpoint(
    'medium',
    `
      margin: unset;
      grid-gap: 25px;
      justify-items: start;
      grid-template-columns: repeat(auto-fill, 160px);
    `
  )}
`

export default withTranslation()(BrowseByApp)
