import large1 from './large/1.png'
import large2 from './large/2.png'
import large3 from './large/3.png'
import large4 from './large/4.png'
import large5 from './large/5.png'

import small1 from './small/1.png'
import small2 from './small/2.png'
import small3 from './small/3.png'
import small4 from './small/4.png'
import small5 from './small/5.png'

const highlights = [
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

export default highlights
