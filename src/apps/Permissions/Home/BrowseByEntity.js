import React from 'react'
import PropTypes from 'prop-types'
import { Table, TableHeader, TableRow, Viewport } from '@aragon/ui'
import Section from '../Section'
import EmptyBlock from '../EmptyBlock'
import EntityRow from './EntityRow'
import { PermissionsConsumer } from '../../../contexts/PermissionsContext'
import { withTranslation } from 'react-i18next'

class BrowseByEntity extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    onOpenEntity: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  render() {
    const { loading, onOpenEntity, t } = this.props
    return (
      <Section title={t('Browse by entity')}>
        <PermissionsConsumer>
          {({ getRolesByEntity }) => {
            if (loading) {
              return <EmptyBlock>{t('Loading permissions…')}</EmptyBlock>
            }

            const roles = getRolesByEntity()
            if (roles.length === 0) {
              return <EmptyBlock>{t('No roles found.')}</EmptyBlock>
            }

            return (
              <Viewport>
                {({ above, below }) => (
                  <Table
                    noSideBorders={below('medium')}
                    header={
                      above('medium') && (
                        <TableRow>
                          <TableHeader
                            title={t('Entity')}
                            style={{ width: '20%' }}
                          />
                          <TableHeader title={t('Type')} />
                          <TableHeader title={t('Actions')} />
                          <TableHeader title="" />
                        </TableRow>
                      )
                    }
                  >
                    {roles.map(({ entity, entityAddress, roles }) => (
                      <EntityRow
                        key={entityAddress}
                        entity={entity}
                        roles={roles}
                        onOpen={onOpenEntity}
                        t={t}
                      />
                    ))}
                  </Table>
                )}
              </Viewport>
            )
          }}
        </PermissionsConsumer>
      </Section>
    )
  }
}

export default withTranslation()(BrowseByEntity)
