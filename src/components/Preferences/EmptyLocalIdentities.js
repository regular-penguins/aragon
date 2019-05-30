import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation, Trans } from 'react-i18next'
import { IdentityBadge, breakpoint } from '@aragon/ui'
import { getEmptyAddress } from '../../web3-utils'
import Import from './Import'

const EmptyLocalIdentities = React.memo(function EmptyLocalIdentities({
  onImport,
}) {
  const { t } = useTranslation()
  return (
    <Wrap>
      <Title>{t('Start adding labels')}</Title>
      <Paragraph>
        <Trans i18nKey="li-abels-help">
          You can add labels by clicking on the{' '}
          <span
            css={`
              display: inline-flex;
              margin-right: 2px;
              vertical-align: text-bottom;
              position: relative;
              top: 3px;
            `}
          >
            <IdentityBadge
              entity={getEmptyAddress()}
              customLabel={t('Address badge')}
              compact
              badgeOnly
            />
          </span>
          anywhere in the app, or importing a .json file with labels by clicking
          "Import" below.
        </Trans>
      </Paragraph>
      <WrapImport>
        <Import onImport={onImport} />
      </WrapImport>
    </Wrap>
  )
})

EmptyLocalIdentities.propTypes = {
  onImport: PropTypes.func.isRequired,
}

const Wrap = styled.div`
  padding: 0 16px;

  ${breakpoint(
    'medium',
    `
      padding: 0;
    `
  )}
`

const WrapImport = styled.div`
  margin: 20px 0;
`

// div cannot appear as descendant of p
const Paragraph = styled.div`
  margin: 16px 0px;
`

const Title = styled.h2`
  font-weight: bold;
  margin: 8px 0;
`

export default EmptyLocalIdentities
