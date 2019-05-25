/* eslint react/prop-types: 0 */
import React from 'react'
import styled from 'styled-components'
import { Spring, animated } from 'react-spring'
import { Button } from '@aragon/ui'
import { lerp } from '../math-utils'
import springs from '../springs'
import { withTranslation } from 'react-i18next'

class PrevNext extends React.Component {
  render() {
    const {
      onPrev,
      onNext,
      enablePrev,
      enableNext,
      visible,
      direction,
      isSigningNext,
      t,
    } = this.props
    return (
      <Spring
        config={springs.smooth}
        to={{ showProgress: Number(visible) }}
        native
      >
        {({ showProgress }) => (
          <Main
            style={{
              pointerEvents: visible ? 'auto' : 'none',
              transform:
                direction === 1
                  ? showProgress.interpolate(
                      v => `translateY(${lerp(v, 40, 0)}px)`
                    )
                  : 'none',
              opacity: showProgress,
            }}
          >
            <PrevNextContent
              onPrev={onPrev}
              onNext={onNext}
              enablePrev={enablePrev}
              enableNext={enableNext}
              isSigningNext={isSigningNext}
              t={t}
            />
          </Main>
        )}
      </Spring>
    )
  }
}

class PrevNextContent extends React.PureComponent {
  render() {
    const { t } = this.props
    return (
      <React.Fragment>
        <Button
          mode="text"
          onClick={this.props.onPrev}
          disabled={!this.props.enablePrev}
        >
          {t('Back')}
        </Button>
        <StrongButton
          mode="strong"
          onClick={this.props.onNext}
          disabled={!this.props.enableNext}
        >
          {this.props.isSigningNext ? 'Finish' : 'Next'}
        </StrongButton>
      </React.Fragment>
    )
  }
}

const Main = styled(animated.div)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 30px 45px;
`

const StrongButton = styled(Button).attrs({ mode: 'strong' })`
  min-width: 120px;
`

export default withTranslation()(PrevNext)
