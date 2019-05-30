import React from 'react'
import PropTypes from 'prop-types'
import { SidePanel, DropDown, Info, Field, Button } from '@aragon/ui'
import { PermissionsConsumer } from '../../contexts/PermissionsContext'
import { AppType } from '../../prop-types'
import { isAddress, isEmptyAddress } from '../../web3-utils'
import AppInstanceLabel from '../../components/AppInstanceLabel'
import EntitySelector from './EntitySelector'
import { withTranslation } from 'react-i18next'

const DEFAULT_STATE = {
  assignEntityIndex: 0,
  assignEntityAddress: '',
  appIndex: 0,
  roleIndex: 0,
}

// The permission panel, wrapped in a PermissionsContext (see end of file)
class AssignPermissionPanel extends React.PureComponent {
  static propTypes = {
    apps: PropTypes.arrayOf(AppType).isRequired,
    grantPermission: PropTypes.func.isRequired,
    getAppRoles: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    opened: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
  }

  state = {
    ...DEFAULT_STATE,
  }

  handleAppChange = index => {
    this.setState({ appIndex: index, roleIndex: 0 })
  }

  handleRoleChange = index => {
    this.setState({ roleIndex: index })
  }

  getNamedApps() {
    const { apps } = this.props
    return apps.filter(app => Boolean(app.name))
  }

  getRoles() {
    const { getAppRoles } = this.props
    const app = this.getSelectedApp()
    const appRoles = app ? getAppRoles(app) : []
    return appRoles.map(({ role }) => role)
  }

  appsLabels() {
    return this.getNamedApps().map(app => (
      <AppInstanceLabel app={app} proxyAddress={app.proxyAddress} />
    ))
  }

  getAppsItems() {
    const { t } = this.props
    return [t('Select an app'), ...this.appsLabels()]
  }

  getRolesItems() {
    const { t } = this.props
    const roles = this.getRoles()
    const names = roles.map(
      role =>
        (role && role.name) ||
        t(`Unknown action ({id})`, (role && role.id) || t('no ID'))
    )
    return [t('Select an action'), ...names]
  }

  getSelectedApp() {
    // -1 for the “select an app” entry
    return this.getNamedApps()[this.state.appIndex - 1]
  }

  canSubmit() {
    const { assignEntityAddress, roleIndex } = this.state

    if (!isAddress(assignEntityAddress)) {
      return false
    }

    if (isEmptyAddress(assignEntityAddress)) {
      return false
    }

    // No role selected
    if (roleIndex === 0) {
      return false
    }

    return true
  }

  handleSubmit = () => {
    const { roleIndex, assignEntityAddress } = this.state
    const { grantPermission, onClose } = this.props

    if (!this.canSubmit()) {
      return
    }

    const selectedApp = this.getSelectedApp()
    // const rolesItems = this.getRolesItems()

    const role = this.getRoles()[roleIndex - 1]
    if (!role) {
      return
    }

    grantPermission({
      entityAddress: assignEntityAddress,
      proxyAddress: selectedApp.proxyAddress,
      roleBytes: role.bytes,
    })

    onClose()
  }

  handlePanelTransitionEnd = () => {
    if (!this.props.opened) {
      this.setState(DEFAULT_STATE)
    }
  }

  handleEntityChange = ({ index, address }) => {
    this.setState({ assignEntityIndex: index, assignEntityAddress: address })
  }

  render() {
    const { opened, onClose, t } = this.props
    const { assignEntityIndex, appIndex, roleIndex } = this.state

    const appsItems = this.getAppsItems()
    const selectedApp = this.getSelectedApp()
    const rolesItems = this.getRolesItems()

    return (
      <SidePanel
        title={t('Add permission')}
        opened={opened}
        onClose={onClose}
        onTransitionEnd={this.handlePanelTransitionEnd}
      >
        <React.Fragment>
          <Field label={t('On app')}>
            <DropDown
              items={appsItems}
              active={appIndex}
              onChange={this.handleAppChange}
              wide
            />
          </Field>

          <EntitySelector
            includeAnyEntity
            label={t('Grant permission to')}
            labelCustomAddress={t('Grant permission to')}
            activeIndex={assignEntityIndex}
            apps={this.getNamedApps()}
            onChange={this.handleEntityChange}
          />

          {selectedApp && (
            <Field label={t('To perform action')}>
              <DropDown
                items={rolesItems}
                active={roleIndex}
                onChange={this.handleRoleChange}
                wide
              />
            </Field>
          )}

          <Field style={{ paddingTop: '20px' }}>
            <Button
              mode="strong"
              onClick={this.handleSubmit}
              disabled={!this.canSubmit()}
              wide
            >
              {t('Add permission')}
            </Button>
          </Field>

          <Info.Action title={t('Adding the permission might create a vote')}>
            {t('x-permisisons-create-vote')}
          </Info.Action>
        </React.Fragment>
      </SidePanel>
    )
  }
}

const AssignPermissionPanelT = withTranslation()(AssignPermissionPanel)

export default props => (
  <PermissionsConsumer>
    {({ getAppRoles, createPermission, grantPermission }) => (
      <AssignPermissionPanelT
        {...props}
        {...{ getAppRoles, createPermission, grantPermission }}
      />
    )}
  </PermissionsConsumer>
)
