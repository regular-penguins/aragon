import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import uniqBy from 'lodash.uniqby'
import {
  TableCell,
  TableRow,
  Text,
  Viewport,
  breakpoint,
  theme,
} from '@aragon/ui'
import LocalIdentityBadge from '../../../components/IdentityBadge/LocalIdentityBadge'
import AppInstanceLabel from '../../../components/AppInstanceLabel'
import ViewDetailsButton from './ViewDetailsButton'
import { FirstTableCell, LastTableCell } from '../Table'
import { withTranslation } from 'react-i18next'

class EntityRow extends React.PureComponent {
  static propTypes = {
    smallView: PropTypes.bool,
    entity: PropTypes.object.isRequired,
    onOpen: PropTypes.func.isRequired,
    roles: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
  }
  static defaultProps = {
    smallView: false,
  }

  open() {
    const { onOpen, entity } = this.props
    onOpen(entity.address)
  }
  renderType(type) {
    switch (type) {
      case 'app':
        return 'App'
      case 'dao':
        return 'DAO'
      default:
        return 'Account'
    }
  }
  renderEntity(entity) {
    if (entity.type === 'any') {
      return <LocalIdentityBadge entity="Any account" /> // Do not translate 'Any account'
    }
    if (entity.type === 'app' && entity.app.name) {
      return <AppInstanceLabel app={entity.app} proxyAddress={entity.address} />
    }
    return <LocalIdentityBadge entity={entity.address} />
  }
  roleTitle({ role, roleBytes, appEntity, proxyAddress }) {
    const { t } = this.props
    if (!appEntity || !appEntity.app) {
      return role
        ? t('{{name}} from unknown', { name: role.name })
        : t('Unknown (from unkwown)')
    }
    const { app } = appEntity
    const roleLabel = (role && role.name) || roleBytes
    return t(`{{roleLabel}} (from app: {app})`, {
      roleLabel,
      app: appEntity.name || app.proxyAddress,
    })
  }
  renderRoles(roles) {
    const { t } = this.props
    roles = uniqBy(roles, ({ roleBytes, proxyAddress }) => {
      return roleBytes + proxyAddress
    })
    if (roles.length === 0) {
      return <Text color={theme.textSecondary}>{t('Unknown roles')}</Text>
    }
    return roles
      .map(roleData => {
        const { role, roleBytes, proxyAddress } = roleData
        return {
          key: roleBytes + proxyAddress,
          title: this.roleTitle(roleData),
          label: (role && role.name) || t('Unknown'),
        }
      })
      .sort(({ label }) => (label === t('Unknown') ? 1 : -1))
      .map(({ key, title, label }, index) => (
        <span key={key}>
          {index > 0 && <span>, </span>}
          <span title={title}>{label}</span>
        </span>
      ))
  }
  handleDetailsClick = () => {
    this.open()
  }
  handleRowClick = () => {
    if (this.props.smallView) {
      this.open()
    }
  }
  render() {
    const { entity, roles, smallView, t } = this.props
    if (!entity) {
      return null
    }

    return (
      <StyledTableRow onClick={this.handleRowClick}>
        <FirstTableCell
          css={`
            > div {
              display: inline-block;
            }
          `}
        >
          {this.renderEntity(entity)}
        </FirstTableCell>
        {!smallView && (
          <React.Fragment>
            <TableCell>{this.renderType(entity.type)}</TableCell>
            <TableCell>
              <div>{this.renderRoles(roles)}</div>
            </TableCell>
          </React.Fragment>
        )}
        <LastTableCell
          align="right"
          css={`
            > div {
              max-width: unset;
            }
          `}
        >
          <ViewDetailsButton
            label={t('View details')}
            onClick={this.handleDetailsClick}
          />
        </LastTableCell>
      </StyledTableRow>
    )
  }
}

const StyledTableRow = styled(TableRow)`
  cursor: pointer;

  ${breakpoint(
    'medium',
    `
      cursor: initial;
    `
  )}
`

const EntityRowT = withTranslation()(EntityRow)

export default props => (
  <Viewport>
    {({ below }) => <EntityRowT {...props} smallView={below('medium')} />}
  </Viewport>
)
