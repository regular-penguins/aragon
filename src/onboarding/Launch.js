/* eslint react/prop-types: 0 */
import React from 'react'
import styled from 'styled-components'
import { theme, Text, Button } from '@aragon/ui'
import { animated } from 'react-spring'
import { withTranslation } from 'react-i18next'

class Launch extends React.Component {
  render() {
    const { onConfirm, screenTransitionStyles, t } = this.props
    return (
      <Main style={screenTransitionStyles}>
        <LaunchContent onConfirm={onConfirm} t={t} />
      </Main>
    )
  }
}

class LaunchContent extends React.PureComponent {
  render() {
    const { t } = this.props
    return (
      <Content>
        <Title>
          <Text size="great" weight="bold" color={theme.textDimmed}>
            {t('All done! Your decentralized organization is ready.')}
          </Text>
        </Title>
        <StyledButton mode="strong" onClick={this.props.onConfirm}>
          {t('Get Started')}
        </StyledButton>
      </Content>
    )
  }
}

const Main = styled(animated.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 100px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Title = styled.h1`
  font-size: 37px;
  text-align: center;
  margin: 0 12% 40px;
`

const StyledButton = styled(Button)`
  width: 170px;
`

export default withTranslation()(Launch)
