import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { format } from 'date-fns'
import { saveAs } from 'file-saver'
import { useTranslation, Trans } from 'react-i18next'
import {
  Button,
  ButtonIcon,
  Checkbox,
  IconCopy,
  IconCross,
  IdentityBadge,
  Modal,
  Info,
  TextInput,
  Toast,
  breakpoint,
  font,
  theme,
} from '@aragon/ui'
import { AragonType } from '../../prop-types'
import LocalIdentityPopoverTitle from '../IdentityBadge/LocalIdentityPopoverTitle'
import { LocalIdentityModalContext } from '../LocalIdentityModal/LocalIdentityModalManager'
import {
  IdentityContext,
  identityEventTypes,
} from '../IdentityManager/IdentityManager'
import EmptyLocalIdentities from './EmptyLocalIdentities'
import Import from './Import'
import { useSelected } from '../../hooks'
import { GU, log } from '../../utils'
import { utoa } from '../../string-utils'

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
const TIMEOUT_TOAST = 4000

const EnhancedLocalIdentities = React.memo(function EnhancedLocalIdentities({
  dao,
  wrapper,
}) {
  const { identityEvents$ } = useContext(IdentityContext)
  const [localIdentities, setLocalIdentities] = useState({})

  const handleGetAll = useCallback(async () => {
    if (!wrapper) {
      return
    }
    setLocalIdentities(await wrapper.getLocalIdentities())
  }, [wrapper])
  const handleClearAll = useCallback(async () => {
    if (!wrapper) {
      return
    }
    await wrapper.clearLocalIdentities()
    setLocalIdentities({})
    identityEvents$.next({ type: identityEventTypes.CLEAR })
  }, [wrapper, identityEvents$])
  const handleModify = useCallback(
    (address, data) => {
      if (!wrapper) {
        return
      }
      wrapper.modifyAddressIdentity(address, data)
    },
    [wrapper]
  )
  const handleImport = useCallback(
    async list => {
      if (!wrapper) {
        return
      }
      setLocalIdentities({})
      for (const { name, address } of list) {
        await wrapper.modifyAddressIdentity(address, { name })
      }
      setLocalIdentities(await wrapper.getLocalIdentities())
      identityEvents$.next({ type: identityEventTypes.IMPORT })
    },
    [wrapper, identityEvents$]
  )

  useEffect(() => {
    handleGetAll()
  }, [handleGetAll])

  return (
    <Content>
      <SelectableLocalIdentities
        dao={dao}
        localIdentities={localIdentities}
        onImport={handleImport}
        onClearAll={handleClearAll}
        onModify={handleModify}
        onModifyEvent={handleGetAll}
      />
    </Content>
  )
})

EnhancedLocalIdentities.propTypes = {
  dao: PropTypes.string.isRequired,
  wrapper: AragonType,
}

const SelectableLocalIdentities = React.memo(
  function SelectableLocalIdentities({
    localIdentities,
    dao,
    onImport,
    onClearAll,
    onModify,
    onModifyEvent,
  }) {
    const identities = useMemo(
      () =>
        Object.entries(localIdentities).map(([address, identity]) => ({
          ...identity,
          address,
        })),
      [localIdentities]
    )
    const initialAddressesSelected = useMemo(
      () => new Map(identities.map(({ address }) => [address, true])),
      [identities]
    )
    const {
      selected: addressesSelected,
      setSelected: setAddressesSelected,
      allSelected,
      someSelected,
    } = useSelected(initialAddressesSelected)

    const handleToggleAll = useCallback(
      () =>
        setAddressesSelected(
          new Map(
            identities.map(({ address }) => [
              address,
              !(allSelected || someSelected),
            ])
          )
        ),
      [identities, allSelected, someSelected, setAddressesSelected]
    )
    const handleToggleAddress = useCallback(
      address => () =>
        setAddressesSelected(
          new Map([
            ...addressesSelected,
            [address, !addressesSelected.get(address)],
          ])
        ),
      [addressesSelected, setAddressesSelected]
    )

    useEffect(() => {
      setAddressesSelected(initialAddressesSelected)
    }, [initialAddressesSelected, setAddressesSelected])

    return (
      <Toast timeout={TIMEOUT_TOAST}>
        {toast => (
          <ShareableLocalIdentities
            addressesSelected={addressesSelected}
            allSelected={allSelected}
            someSelected={someSelected}
            dao={dao}
            identities={identities}
            onClearAll={onClearAll}
            onImport={onImport}
            onModify={onModify}
            onModifyEvent={onModifyEvent}
            onToggleAddress={handleToggleAddress}
            onToggleAll={handleToggleAll}
            toast={toast}
          />
        )}
      </Toast>
    )
  }
)

SelectableLocalIdentities.propTypes = {
  dao: PropTypes.string.isRequired,
  localIdentities: PropTypes.object,
  onClearAll: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onModify: PropTypes.func.isRequired,
  onModifyEvent: PropTypes.func,
}

SelectableLocalIdentities.defaultProps = {
  localIdentities: {},
}

const ShareableLocalIdentities = React.memo(function ShareableLocalIdentities({
  addressesSelected,
  allSelected,
  dao,
  identities,
  onClearAll,
  onImport,
  onModify,
  onModifyEvent,
  onToggleAddress,
  onToggleAll,
  someSelected,
  toast,
}) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const inputRef = useRef()
  const { t } = useTranslation()

  const handleShare = () => setShareModalOpen(true)
  const handleClose = () => setShareModalOpen(false)
  const handleFocus = useCallback(() => inputRef.current.select(), [inputRef])
  const handleCopy = useCallback(() => {
    inputRef.current.focus()
    inputRef.current.select()
    try {
      document.execCommand('copy')
      toast(t('Link copied'))
      setTimeout(handleClose, (TIMEOUT_TOAST * 7) / 8)
    } catch (err) {
      console.warn(err)
    }
  }, [inputRef, toast, t])
  const shareLink = useMemo(() => {
    const base = `${window.location.origin}/#/${dao}`
    try {
      const labels = utoa(
        JSON.stringify(
          identities.filter(({ address }) => addressesSelected.get(address))
        )
      )
      return `${base}?labels=${labels}`
    } catch (err) {
      log('Error while creating the identities sharing link:', err)
      return ''
    }
  }, [dao, identities, addressesSelected])

  useEffect(() => {
    if (shareModalOpen) {
      setTimeout(() => inputRef.current.focus(), 0)
    }
  }, [shareModalOpen])

  return (
    <React.Fragment>
      <Modal visible={shareModalOpen} onClose={handleClose}>
        <header
          css={`
            font-size: 22px;
            line-height: 38px;
            font-weight: bold;
          `}
        >
          {t('Share custom labels')}
        </header>
        <main style={{ marginTop: `${2 * GU}px` }}>
          <div
            css={`
              font-size: 15px;
              line-height: 22px;
            `}
          >
            {t(
              'These labels will be shared with everyone that has access to this link.'
            )}
          </div>
          <div style={{ marginTop: `${2.5 * GU}px` }}>
            <div
              css={`
                font-size: 12px;
                line-height: 16px;
                text-transform: uppercase;
                color: ##6d777b;
              `}
            >
              {t('Link')}
            </div>
            <div
              css={`
                display: inline-flex;
                max-width: 100%;
                width: 100%;
                height: 40px;
                position: relative;
                background: ${theme.contentBackground};
                border: 1px solid ${theme.contentBorder};
                border-radius: 3px;
                box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
                padding-right: 30px;
                margin-top: ${1 * GU}px;
              `}
            >
              <TextInput
                ref={inputRef}
                value={shareLink}
                onFocus={handleFocus}
                readOnly
                css={`
                  text-overflow: ellipsis;
                  width: 100%;
                  max-width: 100%;
                  border: 0;
                  box-shadow: none;
                  background: transparent;
                  &:read-only {
                    color: ${theme.textPrimary};
                    text-shadow: none;
                  }
                `}
              />
              <ButtonIcon
                onClick={handleCopy}
                label="Copy to clipboard"
                css={`
                  position: absolute;
                  top: 0;
                  right: 0;
                  width: 39px;
                  height: 38px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 0 3px 3px 0;
                  &:active {
                    background: rgba(220, 234, 239, 0.3);
                  }
                `}
              >
                <IconCopy />
              </ButtonIcon>
            </div>
          </div>
        </main>
        <footer
          css={`
            margin-top: ${3 * GU}px;
            display: flex;
            justify-content: space-between;

            ${breakpoint(
              'medium',
              `
                display: block;
              `
            )}
          `}
        >
          <Button
            label={t('Close modal')}
            mode="secondary"
            onClick={handleClose}
            css={'width: 117px;'}
          >
            {t('Close')}
          </Button>
          <Button
            mode="strong"
            label={t('Copy link to clipboard')}
            onClick={handleCopy}
            css={`
              width: 117px;
              margin-left: ${2 * GU}px;
            `}
          >
            {t('Copy')}
          </Button>
        </footer>
      </Modal>
      <LocalIdentities
        addressesSelected={addressesSelected}
        allSelected={allSelected}
        someSelected={someSelected}
        dao={dao}
        identities={identities}
        onClearAll={onClearAll}
        onImport={onImport}
        onModify={onModify}
        onModifyEvent={onModifyEvent}
        onShare={handleShare}
        onToggleAddress={onToggleAddress}
        onToggleAll={onToggleAll}
      />
    </React.Fragment>
  )
})

ShareableLocalIdentities.propTypes = {
  addressesSelected: PropTypes.instanceOf(Map).isRequired,
  allSelected: PropTypes.bool.isRequired,
  dao: PropTypes.string.isRequired,
  identities: PropTypes.array.isRequired,
  onClearAll: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onModify: PropTypes.func.isRequired,
  onModifyEvent: PropTypes.func,
  onToggleAddress: PropTypes.func.isRequired,
  onToggleAll: PropTypes.func.isRequired,
  someSelected: PropTypes.bool.isRequired,
  toast: PropTypes.func.isRequired,
}

const LocalIdentities = React.memo(function LocalIdentities({
  addressesSelected,
  allSelected,
  dao,
  identities,
  onClearAll,
  onImport,
  onModify,
  onModifyEvent,
  onShare,
  onToggleAddress,
  onToggleAll,
  someSelected,
}) {
  const { identityEvents$ } = useContext(IdentityContext)
  const { showLocalIdentityModal } = useContext(LocalIdentityModalContext)
  const [confirmationModalOpened, setConfirmationModalOpened] = useState(false)
  const { t } = useTranslation()
  const updateLabel = useCallback(
    address => async () => {
      try {
        await showLocalIdentityModal(address)
        // preferences get all
        onModifyEvent()
        // for iframe apps
        identityEvents$.next({ type: identityEventTypes.MODIFY, address })
      } catch (e) {
        /* nothing was updated */
      }
    },
    [identityEvents$, onModifyEvent, showLocalIdentityModal]
  )
  const handleDownload = useCallback(() => {
    if (someSelected) {
      // standard: https://en.wikipedia.org/wiki/ISO_8601
      const today = format(Date.now(), 'yyyy-MM-dd')
      const blob = new Blob(
        [
          JSON.stringify(
            identities.filter(({ address }) => addressesSelected.get(address))
          ),
        ],
        { type: 'text/json' }
      )
      saveAs(blob, `aragon-labels_${dao}_${today}.json`)
    }
  }, [identities, dao, addressesSelected, someSelected])

  const handleClearAll = useCallback(() => {
    setConfirmationModalOpened(false)
    onClearAll()
  }, [onClearAll])
  const handleOpenConfirmationModal = useCallback(() => {
    setConfirmationModalOpened(true)
  }, [])
  const handleCloseConfirmationModal = useCallback(() => {
    setConfirmationModalOpened(false)
  }, [])

  if (!identities.length) {
    return <EmptyLocalIdentities onImport={onImport} />
  }

  return (
    <React.Fragment>
      <Headers>
        <div>
          {!iOS && (
            <StyledCheckbox
              checked={allSelected}
              onChange={onToggleAll}
              indeterminate={!allSelected && someSelected}
            />
          )}
          {t('Custom label')}
        </div>
        <div>{t('Address')}</div>
      </Headers>
      <List>
        {identities.map(({ address, name }) => (
          <Item key={address}>
            <Label>
              {!iOS && (
                <StyledCheckbox
                  checked={addressesSelected.get(address)}
                  onChange={onToggleAddress(address)}
                />
              )}
              {name}
            </Label>
            <div>
              <IdentityBadge
                entity={address}
                popoverAction={{
                  label: t('Edit custom label'),
                  onClick: updateLabel(address),
                }}
                popoverTitle={<LocalIdentityPopoverTitle label={name} />}
              />
            </div>
          </Item>
        ))}
      </List>
      <Controls>
        <Import onImport={onImport} />
        {!iOS && (
          <Button.Anchor
            label={t('Export labels')}
            mode="secondary"
            onClick={handleDownload}
            disabled={!someSelected}
            style={{ marginLeft: `${3 * GU}px` }}
          >
            {t('Export')}
          </Button.Anchor>
        )}
        <Button
          style={{ margin: `0 ${3 * GU}px ${3 * GU}px` }}
          label={t('Share labels')}
          mode="secondary"
          onClick={onShare}
          disabled={!someSelected}
        >
          {t('Share')}
        </Button>
        <Button
          mode="outline"
          onClick={handleOpenConfirmationModal}
          css={`
            ${breakpoint('medium', `margin-left: auto;`)}
          `}
        >
          <IconCross /> {t('Remove all labels')}
        </Button>
      </Controls>
      <Warning />
      <Modal
        visible={confirmationModalOpened}
        onClose={handleCloseConfirmationModal}
      >
        <ModalTitle>{t('Remove labels')}</ModalTitle>
        <ModalText>
          <Trans i18nKey="i-delete-labels-warning">
            This action will irreversibly delete the selected labels you have
            added to your organization on this device
          </Trans>
        </ModalText>
        <ModalControls>
          <Button
            label={t('Cancel')}
            mode="secondary"
            onClick={handleCloseConfirmationModal}
          >
            {t('Cancel')}
          </Button>
          <RemoveButton
            label={t('Remove labels')}
            mode="strong"
            onClick={handleClearAll}
          >
            {t('Remove')}
          </RemoveButton>
        </ModalControls>
      </Modal>
    </React.Fragment>
  )
})

LocalIdentities.propTypes = {
  addressesSelected: PropTypes.instanceOf(Map).isRequired,
  allSelected: PropTypes.bool.isRequired,
  dao: PropTypes.string.isRequired,
  identities: PropTypes.array.isRequired,
  onClearAll: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onModify: PropTypes.func.isRequired,
  onModifyEvent: PropTypes.func,
  onShare: PropTypes.func.isRequired,
  onToggleAddress: PropTypes.func.isRequired,
  onToggleAll: PropTypes.func.isRequired,
  someSelected: PropTypes.bool.isRequired,
}

LocalIdentities.defaultProps = {
  onModifyEvent: () => null,
}

const ModalTitle = styled.h1`
  font-size: 22px;
`

const ModalText = styled.p`
  margin: ${2.5 * GU}px 0 ${2.5 * GU}px 0;
`

const ModalControls = styled.div`
  display: grid;
  grid-gap: ${1.5 * GU}px;
  grid-template-columns: 1fr 1fr;
  ${breakpoint(
    'medium',
    `
      display: flex;
      justify-content: flex-end;
    `
  )}
`

const StyledCheckbox = styled(Checkbox)`
  margin-right: ${3 * GU}px;
`

const RemoveButton = styled(Button)`
  ${breakpoint(
    'medium',
    `
      margin-left: ${2.5 * GU}px;
    `
  )}
`

const Label = styled.label`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Warning = React.memo(function Warning() {
  const { t } = useTranslation()
  return (
    <StyledInfoAction title={t('All labels are local to your device')}>
      <div>
        <Trans i18nKey="i-labels-only-here">
          Any labels you add or import will only be shown on this device, and
          not stored anywhere else. If you want to share the labels with other
          devices or users, you will need to export them and share the .json
          file
        </Trans>
      </div>
    </StyledInfoAction>
  )
})

const Controls = styled.div`
  display: flex;
  align-items: start;
  flex-wrap: wrap;
  margin-top: ${2.5 * GU}px;
  padding: 0 ${2 * GU}px;

  ${breakpoint(
    'medium',
    `
      padding: 0;
    `
  )}
`

const StyledInfoAction = styled(Info.Action)`
  margin: ${2 * GU}px ${2 * GU}px 0 ${2 * GU}px;

  ${breakpoint(
    'medium',
    `
      margin: 0;
      margin-top: ${2 * GU}px;
    `
  )}
`

const Headers = styled.div`
  margin: ${1.5 * GU}px auto;
  text-transform: uppercase;
  color: ${theme.textSecondary};
  ${font({ size: 'xsmall' })};
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;

  & > div {
    padding-left: ${2 * GU}px;
  }
`

const Item = styled.li`
  padding: ${2 * GU}px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  border-bottom: 1px solid ${theme.contentBorder};

  & > label {
    padding-left: ${2 * GU}px;
  }
`

const List = styled.ul`
  padding: 0;
  list-style: none;
  overflow: hidden;

  li:first-child {
    border-top: 1px solid ${theme.contentBorder};
  }

  ${breakpoint(
    'medium',
    `
      max-height: 50vh;
      overflow: auto;
      border-radius: 4px;
      border: 1px solid ${theme.contentBorder};

      li:first-child {
        border-top: none;
      }
      li:last-child {
        border-bottom: none;
      }
    `
  )}
`

const Content = styled.main`
  padding-top: 16px;
`

export default EnhancedLocalIdentities
