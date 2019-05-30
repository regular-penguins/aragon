import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { SafeLink } from '@aragon/ui'
import { EthereumAddressType } from '../../prop-types'
import EtherscanLink from '../Etherscan/EtherscanLink'

const AddressLink = ({ children, to }) => {
  const { t } = useTranslation()
  return to ? (
    <EtherscanLink address={to}>
      {url =>
        url ? (
          <SafeLink href={url} target="_blank">
            {children || to}
          </SafeLink>
        ) : (
          to
        )
      }
    </EtherscanLink>
  ) : (
    t('an address or app')
  )
}

AddressLink.propTypes = {
  children: PropTypes.node,
  to: EthereumAddressType,
}

export default AddressLink
