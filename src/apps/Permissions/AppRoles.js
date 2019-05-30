import React from 'react'
import PropTypes from 'prop-types'
import { Button, Table, TableRow, Text, Viewport } from '@aragon/ui'
import { AppType, EthereumAddressType } from '../../prop-types'
import { TableHeader, TableCell, FirstTableCell, LastTableCell } from './Table'
import LocalIdentityBadge from '../../components/IdentityBadge/LocalIdentityBadge'
import { PermissionsConsumer } from '../../contexts/PermissionsContext'
import Section from './Section'
import EmptyBlock from './EmptyBlock'
import AppInstanceLabel from '../../components/AppInstanceLabel'
import { isBurnEntity } from '../../permissions'
import { isEmptyAddress } from '../../web3-utils'
import { withTranslation } from 'react-i18next'

class AppRoles extends React.PureComponent {
  static propTypes = {
    app: AppType,
    emptyLabel: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    loadingLabel: PropTypes.string,
    onManageRole: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  handleManageRole = roleBytes => {
    this.props.onManageRole(this.props.app.proxyAddress, roleBytes)
  }
  render() {
    const {
      app,
      loading,
      t,
      loadingLabel = t('Loading actions…'),
      emptyLabel = t('No actions found.'),
    } = this.props

    return (
      <PermissionsConsumer>
        {({ getRoleManager }) => {
          const roles = ((app && app.roles) || []).map(role => ({
            role,
            manager: getRoleManager(app, role.bytes),
          }))

          return (
            <Section title={t('Actions available on this app')}>
              {loading || roles.length === 0 ? (
                <EmptyBlock>{loading ? loadingLabel : emptyLabel}</EmptyBlock>
              ) : (
                <Viewport>
                  {({ below }) => (
                    <Table
                      noSideBorders={below('medium')}
                      header={
                        <TableRow>
                          <TableHeader
                            title={t('Action')}
                            style={{ width: '20%' }}
                          />
                          <TableHeader title={t('Managed by')} />
                          <TableHeader />
                        </TableRow>
                      }
                    >
                      {roles.map(({ role, manager }, i) => (
                        <RoleRow
                          key={i}
                          role={role}
                          manager={manager}
                          onManage={this.handleManageRole}
                          t={t}
                        />
                      ))}
                    </Table>
                  )}
                </Viewport>
              )}
            </Section>
          )
        }}
      </PermissionsConsumer>
    )
  }
}

class RoleRow extends React.Component {
  static propTypes = {
    onManage: PropTypes.func.isRequired,
    role: PropTypes.shape({ bytes: PropTypes.string }).isRequired,
    manager: PropTypes.shape({
      type: PropTypes.string,
      address: EthereumAddressType,
    }).isRequired,
    t: PropTypes.func.isRequired,
  }
  handleManageClick = () => {
    this.props.onManage(this.props.role.bytes)
  }
  renderManager() {
    const { manager, t } = this.props
    if (manager.type === 'app') {
      return (
        <AppInstanceLabel app={manager.app} proxyAddress={manager.address} />
      )
    }
    return (
      <LocalIdentityBadge
        entity={manager.type === 'burn' ? t('Discarded') : manager.address}
      />
    )
  }
  render() {
    const { role, manager, t } = this.props
    const name = (role && role.name) || t('Unknown action')
    const emptyManager = isEmptyAddress(manager.address)
    const discardedManager = isBurnEntity(manager.address)

    return (
      <TableRow>
        <FirstTableCell>
          <Text weight="bold">{name}</Text>
        </FirstTableCell>
        <TableCell>
          {emptyManager ? t('No manager set') : this.renderManager()}
        </TableCell>
        <LastTableCell align="right">
          <Button
            compact
            mode="outline"
            style={{ minWidth: '80px' }}
            onClick={this.handleManageClick}
          >
            {emptyManager
              ? t('Initialize')
              : discardedManager
              ? t('View')
              : t('Manage')}
          </Button>
        </LastTableCell>
      </TableRow>
    )
  }
}

export default withTranslation()(AppRoles)
