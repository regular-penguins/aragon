/* eslint react/prop-types: 0 */
import React from 'react'
import styled from 'styled-components'
import { theme, Text } from '@aragon/ui'
import { animated } from 'react-spring'
import { noop } from '../utils'
import TemplateCard from './TemplateCard'
import { withTranslation } from 'react-i18next'

class Template extends React.PureComponent {
  static defaultProps = {
    onSelect: noop,
  }
  handleTemplateSelect = template => {
    this.props.onSelect(template)
  }
  render() {
    const { templates, activeTemplate, screenTransitionStyles, t } = this.props
    return (
      <Main>
        <Content style={screenTransitionStyles}>
          <TemplateContent
            templates={templates}
            activeTemplate={activeTemplate}
            handleTemplateSelect={this.handleTemplateSelect}
            t={t}
          />
        </Content>
      </Main>
    )
  }
}

class TemplateContent extends React.Component {
  render() {
    const { t } = this.props
    return (
      <React.Fragment>
        <Title>
          <Text size="great" weight="bold" color={theme.textDimmed}>
            {t('Create a new organization')}
          </Text>
        </Title>

        <p>
          <Text size="large" color={theme.textSecondary}>
            {t('Choose a template to get started')}
          </Text>
        </p>

        <Templates>
          {[...this.props.templates.entries()].map(
            ([template, { label, icon }], i) => (
              <TemplateCardWrapper key={i}>
                <TemplateCard
                  template={template}
                  icon={icon}
                  label={label(t)}
                  active={template === this.props.activeTemplate}
                  onSelect={this.props.handleTemplateSelect}
                />
              </TemplateCardWrapper>
            )
          )}
        </Templates>
      </React.Fragment>
    )
  }
}

const Main = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 100px;
  padding-top: 140px;
`

const Content = styled(animated.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Title = styled.h1`
  font-size: 37px;
  margin-bottom: 40px;
`

const Templates = styled.div`
  display: flex;
  margin-top: 50px;
`

const TemplateCardWrapper = styled.div`
  & + & {
    margin-left: 25px;
  }
`

export default withTranslation()(Template)
