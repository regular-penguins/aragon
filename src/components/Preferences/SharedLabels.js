import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation, Trans } from 'react-i18next'
import {
  Button,
  Checkbox,
  IdentityBadge,
  Toast,
  breakpoint,
  font,
  theme,
} from '@aragon/ui'
import {
  IdentityContext,
  identityEventTypes,
} from '../IdentityManager/IdentityManager'
import LoadingRing from '../LoadingRing'
import { AragonType } from '../../prop-types'
import { GU } from '../../utils'
import { useSelected } from '../../hooks'

const SharedLabels = React.memo(function SharedLabels({
  onSave,
  onClose,
  labels,
  toast,
  wrapper,
}) {
  const { t } = useTranslation()
  const { identityEvents$ } = React.useContext(IdentityContext)
  const { selected, setSelected, allSelected, someSelected } = useSelected(
    new Map()
  )
  const [saving, setSaving] = React.useState(false)

  const onToggleAll = React.useCallback(
    () =>
      setSelected(
        new Map(
          labels.map(({ address }) => [address, !(allSelected || someSelected)])
        )
      ),
    [labels, allSelected, someSelected, setSelected]
  )
  const onToggleAddress = React.useCallback(
    address => () =>
      setSelected(new Map([...selected, [address, !selected.get(address)]])),
    [selected, setSelected]
  )
  const handleSave = React.useCallback(async () => {
    if (!wrapper) {
      return
    }
    setSaving(true)
    const list = labels.filter(({ address }) => selected.get(address))
    for (const { name, address } of list) {
      await wrapper.modifyAddressIdentity(address, { name })
    }
    identityEvents$.next({ type: identityEventTypes.IMPORT })

    // toast
    toast('Custom labels added')

    onSave()
  }, [selected, labels, wrapper, identityEvents$, toast, onSave])

  React.useEffect(() => {
    setSelected(new Map(labels.map(({ address }) => [address, true])))
  }, [labels, setSelected])

  return (
    <Content>
      <div
        css={`
          margin-top: ${2 * GU}px;
          padding: 0 ${2 * GU}px;
          font-size: 15px;
          line-height: 22px;
        `}
      >
        <Trans i18nKey="i-shared-labels">
          These labels have been shared with you. By clicking on the “Save”
          button, you will make them appear on this device (labels will be
          stored locally).
        </Trans>
      </div>
      <Headers style={{ marginTop: `${5 * GU}px` }}>
        <div>
          <StyledCheckbox
            checked={allSelected}
            onChange={onToggleAll}
            indeterminate={!allSelected && someSelected}
          />
          {t('Custom label')}
        </div>
        <div
          css={`
            padding-right: ${2 * GU}px;
            text-align: right;

            ${breakpoint(
              'medium',
              `
                text-align: left;
              `
            )}
          `}
        >
          <span
            css={`
              display: inline-block;
              width: 138.65px;
              text-align: left;
            `}
          >
            {t('Address')}
          </span>
        </div>
      </Headers>
      <List>
        {saving && (
          <Saving>
            <LoadingRing spin />
            <div>{t('Loading…')}</div>
          </Saving>
        )}
        {labels.map(({ address, name }) => (
          <Item
            key={address}
            style={{ visibility: saving ? 'hidden' : 'visible' }}
          >
            <Label>
              <StyledCheckbox
                checked={selected.get(address)}
                onChange={onToggleAddress(address)}
              />
              {name}
            </Label>
            <div
              css={`
                padding-right: ${2 * GU}px;
                text-align: right;

                ${breakpoint(
                  'medium',
                  `
                    text-align: left;
                  `
                )}
              `}
            >
              <IdentityBadge entity={address} />
            </div>
          </Item>
        ))}
      </List>

      <Controls>
        <Button
          label={t('Cancel')}
          mode="secondary"
          onClick={onClose}
          css="width: 117px"
          disabled={saving}
        >
          {t('Cancel')}
        </Button>
        <Button
          label={t('Save')}
          mode="strong"
          disabled={!someSelected || saving}
          onClick={handleSave}
          css={`
            width: 117px;

            ${breakpoint(
              'medium',
              `
                margin-left: ${2 * GU}px;
              `
            )}
          `}
        >
          Save
        </Button>
      </Controls>
    </Content>
  )
})

SharedLabels.propTypes = {
  labels: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  toast: PropTypes.func.isRequired,
  wrapper: AragonType,
}

const Saving = styled.li`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Content = styled.main`
  padding-top: ${2 * GU}px;
`

const StyledCheckbox = styled(Checkbox)`
  margin-right: ${3 * GU}px;
`

const Label = styled.label`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${2.5 * GU}px;
  padding: 0 ${2 * GU}px;

  ${breakpoint(
    'medium',
    `
      display: block;
      padding: 0;
      text-align: right;
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
  position: relative;
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

export default React.memo(props => (
  <Toast>{toast => <SharedLabels {...props} toast={toast} />}</Toast>
))
