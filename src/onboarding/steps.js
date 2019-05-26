export const Start = Symbol('Start')
export const Template = Symbol('Template')
export const Domain = Symbol('Domain')
export const Configure = Symbol('Configure')
export const Sign = Symbol('Sign')
export const Launch = Symbol('Launch')

export const ProgressBarGroups = [
  { group: Template, label: t => t('Choose Template') },
  { group: Domain, label: t => t('Claim Domain') },
  { group: Configure, label: t => t('Configure') },
  { group: Launch, label: t => t('Launch') },
]
