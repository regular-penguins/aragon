import large1 from './highlights/large/1.png'
import large2 from './highlights/large/2.png'
import large3 from './highlights/large/3.png'
import large4 from './highlights/large/4.png'
import large5 from './highlights/large/5.png'

import small1 from './highlights/small/1.png'
import small2 from './highlights/small/2.png'
import small3 from './highlights/small/3.png'
import small4 from './highlights/small/4.png'
import small5 from './highlights/small/5.png'

export const banner = {
  text: {
    large: t => t('Upgrade your organization to the 0.7 Bella release! 🎉'),
    small: t => t('Upgrade to 0.7 Bella! 🎉'),
  },
  button: t => t('More info'),
}

export const highlights = [
  {
    title: {
      small: null,
      large: t => t('Custom labels for apps and addresses'),
    },
    description: {
      small: null,
      large: t => t(`x-upgrade-custom-labels`),
    },
    visual: {
      small: small1,
      large: large1,
      color: '#ebf5f4',
    },
  },
  {
    title: {
      small: null,
      large: t => t('Get activity notifications'),
    },
    description: {
      small: null,
      large: t => t(`x-upgrade-get-activity-notifications`),
    },
    visual: {
      small: small2,
      large: large2,
      color: '#d9dfee',
    },
  },
  {
    title: {
      small: null,
      large: t => t('Export your finances in one click'),
    },
    description: {
      small: null,
      large: t => t(`x-upgrade-export-finances`),
    },
    visual: {
      small: small3,
      large: large3,
      color: '#fdefe0',
    },
  },
  {
    title: {
      small: null,
      large: t => t('Update apps from the App Center'),
    },
    description: {
      small: null,
      large: t => t(`x-upgrade-update-apps`),
    },
    visual: {
      small: small4,
      large: large4,
      color: '#dff3ec',
    },
  },
  {
    title: {
      small: null,
      large: t => t('Complete responsive view'),
    },
    description: {
      small: null,
      large: t => t(`x-upgrade-responsive-view`),
    },
    visual: {
      small: small5,
      large: large5,
      color: '#dcddf0',
    },
    upgrade: {
      small: t => t('Try Bella now'),
      large: t => t('Upgrade your organization'),
    },
  },
]
