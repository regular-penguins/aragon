import React from 'react'
import PropTypes from 'prop-types'
import { Button, Table, TableRow, Text, Viewport } from '@aragon/ui'
import LocalIdentityBadge from '../../components/IdentityBadge/LocalIdentityBadge'
import { TableHeader, TableCell, FirstTableCell, LastTableCell } from './Table'
import { PermissionsConsumer } from '../../contexts/PermissionsContext'
import { AppType, EthereumAddressType } from '../../prop-types'
import Section from './Section'
import EmptyBlock from './EmptyBlock'
import AppInstanceLabel from '../../components/AppInstanceLabel'
import EntityPermissions from './EntityPermissions'
import AppRoles from './AppRoles'
import { withTranslation } from 'react-i18next'

class AppPermissions extends React.PureComponent {
  static propTypes = {
    address: EthereumAddressType.isRequired,
    app: AppType, // may not be available if still loading
    loading: PropTypes.bool.isRequired,
    onManageRole: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }
  render() {
    const { app, loading, address, onManageRole, t } = this.props
    return (
      <PermissionsConsumer>
        {({ revokePermission, getAppPermissions }) => {
          const appPermissions = getAppPermissions(app)
          return (
            <React.Fragment>
              <AppRoles
                app={app}
                loading={loading}
                onManageRole={onManageRole}
              />
              <Section title={t('Permissions set on this app')}>
                {loading || appPermissions.length === 0 ? (
                  <EmptyBlock>
                    {loading
                      ? t('Loading app permissions…')
                      : t('No permissions set.')}
                  </EmptyBlock>
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
                            <TableHeader title={t('Allowed for')} />
                            <TableHeader />
                          </TableRow>
                        }
                      >
                        {appPermissions.map(({ role, entity }, i) => (
                          <Row
                            key={i}
                            role={role}
                            entity={entity}
                            proxyAddress={address}
                            onRevoke={revokePermission}
                            t={t}
                          />
                        ))}
                      </Table>
                    )}
                  </Viewport>
                )}
              </Section>
              <EntityPermissions
                title={t('Permissions granted to this app')}
                noPermissionsLabel={t('No permissions granted.')}
                address={address}
                loading={loading}
                onRevoke={revokePermission}
              />
            </React.Fragment>
          )
        }}
      </PermissionsConsumer>
    )
  }
}

class Row extends React.Component {
  static propTypes = {
    entity: PropTypes.object.isRequired,
    onRevoke: PropTypes.func.isRequired,
    proxyAddress: EthereumAddressType.isRequired,
    role: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
  }

  handleRevoke = () => {
    const { onRevoke, role, entity, proxyAddress } = this.props
    onRevoke({
      proxyAddress,
      roleBytes: role.bytes,
      entityAddress: entity.address,
    })
  }
  renderEntity() {
    const { entity, t } = this.props
    if (!entity) {
      return t('Unknown')
    }
    if (entity.type === 'app') {
      return <AppInstanceLabel app={entity.app} proxyAddress={entity.address} />
    }

    return (
      <LocalIdentityBadge
        entity={entity.type === 'any' ? 'Any account' : entity.address}
      />
    )
  }
  render() {
    const { role, t } = this.props
    return (
      <TableRow>
        <FirstTableCell>
          <Text weight="bold">{role ? role.name : t('Unknown')}</Text>
        </FirstTableCell>
        <TableCell>{this.renderEntity()}</TableCell>
        <LastTableCell align="right">
          <Button
            mode="outline"
            emphasis="negative"
            compact
            onClick={this.handleRevoke}
          >
            {t('Revoke')}
          </Button>
        </LastTableCell>
      </TableRow>
    )
  }
}

export default withTranslation()(AppPermissions)
