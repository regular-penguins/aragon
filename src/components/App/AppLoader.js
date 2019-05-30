import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { isStaticApp } from '../../static-apps'
import LoadingScreen from '../LoadingScreen/LoadingScreen'

const LOADING_ORG = t => t('Loading organization…')
const LOADING_APPS = t => t('Loading apps…')
const LOADING_APP = (t, app) => t('Loading {app}…', { app })
const LOADING_READY = t => t('Ready.')

// Pick the loading steps depending on what is being loaded (settings, internal
// app, external app, …). `steps` must contain the strings used to represent
// the different steps, while `stepIndex` must return the index of the current
// step, based on the passed values.
const LOADING_STEPS_INTERNAL = {
  steps: [LOADING_ORG, LOADING_APPS, LOADING_READY],
  stepIndex: ({ daoLoading, appsLoading }) =>
    [daoLoading, appsLoading, true].findIndex(v => v),
}

const LOADING_STEPS_SETTINGS = {
  steps: [LOADING_ORG, LOADING_READY],
  stepIndex: ({ daoLoading }) => [daoLoading, true].findIndex(v => v),
}

const LOADING_STEPS_EXTERNAL = {
  steps: [LOADING_ORG, LOADING_APPS, LOADING_APP, LOADING_READY],
  stepIndex: ({ daoLoading, appsLoading, appLoading }) =>
    [daoLoading, appsLoading, appLoading, true].findIndex(v => v),
}

function getLoadingSteps(instanceId) {
  // Settings app
  if (instanceId === 'settings') {
    return LOADING_STEPS_SETTINGS
  }
  // Internal app
  if (isStaticApp(instanceId)) {
    return LOADING_STEPS_INTERNAL
  }
  // External app
  return LOADING_STEPS_EXTERNAL
}

function useLoadingStatus({
  appLoading,
  appsLoading,
  currentAppName,
  daoLoading,
  instanceId,
}) {
  const [{ label, progress }, setStatus] = useState({ label: '', progress: 0 })

  const loadingSteps = getLoadingSteps(instanceId)

  const { t } = useTranslation()

  // Update the step index
  useEffect(() => {
    const stepIndex = loadingSteps.stepIndex({
      daoLoading,
      appsLoading,
      appLoading,
    })

    const app = currentAppName || instanceId
    const label = loadingSteps.steps[stepIndex](t, { app })
    const progress = stepIndex / (loadingSteps.steps.length - 1)

    setStatus({ label, progress })
  }, [
    appLoading,
    appsLoading,
    daoLoading,
    loadingSteps,
    currentAppName,
    instanceId,
    t,
  ])

  return { label, progress }
}

const AppLoader = React.memo(function AppLoader({
  appLoading,
  appsLoading,
  children,
  currentAppName,
  daoLoading,
  instanceId,
}) {
  const loadingStatus = useLoadingStatus({
    appLoading,
    appsLoading,
    currentAppName,
    daoLoading,
    instanceId,
  })

  return (
    <div
      css={`
        position: relative;
        width: 100%;
        height: 100%;
      `}
    >
      <div
        css={`
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
        `}
        style={{ opacity: Number(loadingStatus.progress === 1) }}
      >
        {children}
      </div>
      <LoadingScreen
        title={loadingStatus.label}
        progress={loadingStatus.progress}
        css="z-index: 2"
      />
    </div>
  )
})

AppLoader.propTypes = {
  appLoading: PropTypes.bool.isRequired,
  appsLoading: PropTypes.bool.isRequired,
  children: PropTypes.node,
  currentAppName: PropTypes.string.isRequired,
  daoLoading: PropTypes.bool.isRequired,
  instanceId: PropTypes.string.isRequired,
}

export default AppLoader
