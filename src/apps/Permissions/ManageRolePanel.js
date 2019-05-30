import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  SidePanel,
  DropDown,
  Info,
  Field,
  Button,
  breakpoint,
} from '@aragon/ui'
import LocalIdentityBadge from '../../components/IdentityBadge/LocalIdentityBadge'
import { PermissionsConsumer } from '../../contexts/PermissionsContext'
import { isBurnEntity } from '../../permissions'
import { AppType } from '../../prop-types'
import { isAddress, isEmptyAddress } from '../../web3-utils'
import AppInstanceLabel from '../../components/AppInstanceLabel'
import EntitySelector from './EntitySelector'
import { withTranslation } from 'react-i18next'

const CREATE_PERMISSION = Symbol('CREATE_PERMISSION')
const VIEW_PERMISSION = Symbol('VIEW_PERMISSION')
const NO_UPDATE_ACTION = Symbol('NO_UPDATE_ACTION')
const SET_PERMISSION_MANAGER = Symbol('SET_PERMISSION_MANAGER')
const REMOVE_PERMISSION_MANAGER = Symbol('REMOVE_PERMISSION_MANAGER')

const UPDATE_ACTIONS = new Map([
  [NO_UPDATE_ACTION, { label: t => t('Select an action'), message: t => null }],
  [
    SET_PERMISSION_MANAGER,
    {
      label: t => t('Change the manager'),
      message: t => t(`x-manage-role-change-manager`),
    },
  ],
  [
    REMOVE_PERMISSION_MANAGER,
    {
      label: t => t('Remove the manager'),
      message: t => t(`x-manage-role-remove-manager`),
    },
  ],
])

const ACTIONS = new Map([
  ...UPDATE_ACTIONS,
  [
    CREATE_PERMISSION,
    {
      label: t => null,
      message: t => t(`x-manage-role-create-permisison`),
    },
  ],
  [
    VIEW_PERMISSION,
    {
      label: t => null,
      message: t => t(`x-manage-role-view-permission`),
    },
  ],
])

const DEFAULT_STATE = {
  assignEntityIndex: 0,
  assignEntityAddress: '',
  updateAction: NO_UPDATE_ACTION,
  assignManagerIndex: 0,
  newRoleManagerValue: '',
}

// The role manager panel, wrapped in a PermissionsContext (see end of file)
class ManageRolePanel extends React.PureComponent {
  static propTypes = {
    app: AppType,
    apps: PropTypes.arrayOf(AppType).isRequired,
    createPermission: PropTypes.func.isRequired,
    getRoleManager: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    opened: PropTypes.bool.isRequired,
    removePermissionManager: PropTypes.func.isRequired,
    role: PropTypes.object,
    setPermissionManager: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  state = {
    ...DEFAULT_STATE,
  }

  handleUpdateActionChange = index => {
    this.setState({
      updateAction: this.getUpdateAction(index) || null,
    })
  }

  getCurrentAction() {
    const { updateAction } = this.state
    const manager = this.getManager()
    return isEmptyAddress(manager.address)
      ? CREATE_PERMISSION
      : isBurnEntity(manager.address)
      ? VIEW_PERMISSION
      : updateAction
  }

  getUpdateAction(index) {
    return [...UPDATE_ACTIONS.keys()][index]
  }

  getUpdateActionIndex() {
    const { updateAction } = this.state
    return [...UPDATE_ACTIONS.keys()].indexOf(updateAction)
  }

  getUpdateActionsItems() {
    const { t } = this.props
    return [...UPDATE_ACTIONS.values()].map(({ label }) => label(t))
  }

  getManager() {
    const { getRoleManager, app, role } = this.props
    return getRoleManager(app, role && role.bytes)
  }

  getNamedApps() {
    const { apps } = this.props
    return apps.filter(app => Boolean(app.name))
  }

  getMessage(action) {
    const { t } = this.props
    const data = ACTIONS.get(action)
    return (data && data.message(t)) || ''
  }

  // Filter and validate the role manager value. Returns false if invalid.
  filterNewRoleManager(value) {
    const address = (value && value.trim()) || ''
    return isAddress(address) ? address : false
  }

  canSubmit() {
    const { newRoleManagerValue, assignEntityAddress } = this.state
    const action = this.getCurrentAction()

    if (action === REMOVE_PERMISSION_MANAGER) {
      return true
    }

    if (action === SET_PERMISSION_MANAGER) {
      return this.filterNewRoleManager(newRoleManagerValue) !== false
    }

    if (action === CREATE_PERMISSION) {
      if (!isAddress(assignEntityAddress)) {
        return false
      }

      if (isEmptyAddress(assignEntityAddress)) {
        return false
      }

      return this.filterNewRoleManager(newRoleManagerValue) !== false
    }

    return false
  }

  handleSubmit = () => {
    const { newRoleManagerValue, assignEntityAddress } = this.state
    const {
      app,
      onClose,
      createPermission,
      removePermissionManager,
      setPermissionManager,
      role,
    } = this.props

    const action = this.getCurrentAction()

    if (!this.canSubmit()) {
      return
    }

    if (action === REMOVE_PERMISSION_MANAGER) {
      removePermissionManager({
        proxyAddress: app.proxyAddress,
        roleBytes: role.bytes,
      })
    }

    if (action === SET_PERMISSION_MANAGER) {
      setPermissionManager({
        entityAddress: this.filterNewRoleManager(newRoleManagerValue),
        proxyAddress: app.proxyAddress,
        roleBytes: role.bytes,
      })
    }

    if (action === CREATE_PERMISSION) {
      createPermission({
        entityAddress: assignEntityAddress,
        proxyAddress: app.proxyAddress,
        roleBytes: role.bytes,
        manager: this.filterNewRoleManager(newRoleManagerValue),
      })
    }

    onClose()
  }

  handlePanelTransitionEnd = () => {
    if (!this.props.opened) {
      this.setState(DEFAULT_STATE)
    }
  }

  handleRoleManagerChange = ({ index, address }) => {
    this.setState({ assignManagerIndex: index, newRoleManagerValue: address })
  }

  handleEntityChange = ({ index, address }) => {
    this.setState({ assignEntityIndex: index, assignEntityAddress: address })
  }

  renderManager = () => {
    const { t } = this.props
    const manager = this.getManager()
    const emptyManager = isEmptyAddress(manager.address)
    if (emptyManager) {
      return t('No manager')
    }
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
    const { opened, onClose, app, role, t } = this.props
    const { assignManagerIndex, assignEntityIndex } = this.state

    const updateActionsItems = this.getUpdateActionsItems()
    const updateActionIndex = this.getUpdateActionIndex()

    const action = this.getCurrentAction()
    const isUpdateAction = UPDATE_ACTIONS.has(action)
    const message = this.getMessage(action)

    return (
      <SidePanel
        title={
          action === CREATE_PERMISSION
            ? t('Initialize permission')
            : action === VIEW_PERMISSION
            ? t('View permission')
            : t('Manage permission')
        }
        opened={opened}
        onClose={onClose}
        onTransitionEnd={this.handlePanelTransitionEnd}
      >
        <React.Fragment>
          <Field label={t('App')}>
            {app && (
              <AppInstanceLabel
                app={app}
                proxyAddress={app.proxyAddress}
                showIcon={false}
              />
            )}
          </Field>

          <Field label={t('Action description')}>{role && role.name}</Field>

          {(action === VIEW_PERMISSION || isUpdateAction) && (
            <Field label={t('Manager')}>
              <FlexRow>{this.renderManager()}</FlexRow>
            </Field>
          )}

          {isUpdateAction && (
            <Field label={t('Action')}>
              <DropDown
                items={updateActionsItems}
                active={updateActionIndex}
                onChange={this.handleUpdateActionChange}
                wide
              />
            </Field>
          )}

          {action === SET_PERMISSION_MANAGER && (
            <EntitySelector
              label={t('New manager')}
              labelCustomAddress={t('Address for new manager')}
              activeIndex={assignManagerIndex}
              apps={this.getNamedApps()}
              onChange={this.handleRoleManagerChange}
            />
          )}

          {action === CREATE_PERMISSION && (
            <React.Fragment>
              <EntitySelector
                includeAnyEntity
                label={t('Grant permission to')}
                labelCustomAddress={t('Grant permission to')}
                activeIndex={assignEntityIndex}
                apps={this.getNamedApps()}
                onChange={this.handleEntityChange}
              />
              <EntitySelector
                label={t('Manager')}
                labelCustomAddress={t('Address for manager')}
                activeIndex={assignManagerIndex}
                apps={this.getNamedApps()}
                onChange={this.handleRoleManagerChange}
              />
            </React.Fragment>
          )}

          {(isUpdateAction || action === CREATE_PERMISSION) && (
            <Field style={{ paddingTop: '20px' }}>
              <Button
                mode="strong"
                onClick={this.handleSubmit}
                disabled={!this.canSubmit()}
                wide
              >
                {isUpdateAction
                  ? t('Update permission')
                  : t('Initialize permission')}
              </Button>
            </Field>
          )}

          {message && <Info.Action title={t('Info')}>{message}</Info.Action>}
        </React.Fragment>
      </SidePanel>
    )
  }
}

const ManageRolePanelT = withTranslation(ManageRolePanel)

const FlexRow = styled.div`
  display: inline-flex;
  align-items: center;

  ${breakpoint(
    'medium',
    `
      display: flex;
    `
  )}
`

export default props => (
  <PermissionsConsumer>
    {({
      createPermission,
      getRoleManager,
      removePermissionManager,
      setPermissionManager,
    }) => (
      <ManageRolePanelT
        {...props}
        {...{
          createPermission,
          getRoleManager,
          removePermissionManager,
          setPermissionManager,
        }}
      />
    )}
  </PermissionsConsumer>
)
