import React from 'react'
import PropTypes from 'prop-types'
import { Button, ButtonIcon, IconArrowRight, Viewport } from '@aragon/ui'
import { withTranslation } from 'react-i18next'

const ViewDetailsButton = ({ t, ...props }) => (
  <Viewport>
    {({ below }) =>
      below('medium') ? (
        <ButtonIcon {...props}>
          <IconArrowRight />
        </ButtonIcon>
      ) : (
        <Button mode="outline" compact {...props}>
          {t('View details')}
        </Button>
      )
    }
  </Viewport>
)

ViewDetailsButton.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withTranslation()(ViewDetailsButton)
