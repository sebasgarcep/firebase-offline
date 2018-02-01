import yup from 'yup'
import thunk from 'redux-thunk'
import { key as firebaseKey } from 'firebase-key'
import { applyMiddleware } from 'redux'
import { offline } from '@redux-offline/redux-offline'

import promisifyTools from './promisify-tools'
import validateSettings from './validate-settings'

export default function (settingsDirty) {
  const settings = validateSettings(settingsDirty)

  const {
    tools: basicTools,
    platform,
    storage,
    onRehydrate,
    validate
  } = settings

  const native = platform === 'ios' || platform === 'android'

  const tools = {
    ...promisifyTools(basicTools),
    generatePushKey: () => firebaseKey(),
    generateTimestamp: () => (new Date()).getTime()
  }

  const offlineConfig = {
    detectNetwork: (statusCallback) => {
      tools.detectNetworkChanges(statusCallback)
    },
    effect: (effect/* , action */) => {
      if (!effect.updates) return Promise.resolve(true)
      return tools.commit(effect.updates)
    },
    /*
      in web use localForage
      in react native use AsyncStorage
      in android use ___
      in ios use ___
    */
    persistOptions: {
      storage
    },
    persistCallback: onRehydrate,
    discard: (/* error, action, retries */) => {
      return true
    },
    retry: (/* action, retries */) => {
      const time = 10/* minutes */ * 60/* seconds */ * 1000/* milliseconds */
      return time
    }
  }

  const app = {
    actions: {},
    selectors: {},
    reducers: {},
    middleware: [applyMiddleware(thunk), offline(offlineConfig)],

    settings: {
      platform,
      native
    },

    use: (extension) => {
      extension(app, tools)
    },

    compile: () => {
      const newActions = {}

      Object.keys(app.actions).forEach((key) => {
        const config = app.actions[key]

        if (typeof config !== 'object' || config === null) throw new Error()
        if (config.validate && typeof config.validate !== 'object') throw new Error()
        if (config.pre && !Array.isArray(config.pre)) throw new Error()
        if (!config.handler) throw new Error()

        let middleware = []

        if (config.pre) {
          middleware = middleware.concat(config.pre)
        }

        middleware.push(config.handler)

        newActions[key] = (paramsPre = {}) => (dispatch, getState) =>
          let validationJob = Promise.resolve(paramsPre)

          if (config.validate) {
            const schema = yup.object().shape(config.validate)
            validationJob = schema.validate(params, validate)
          }

          validationJob.then(params => {
            return middleware.reduce((acc, mid) => {
              return acc.then(() => mid(params, tools)(dispatch, getState))
            }, Promise.resolve(true))
          })
      })

      app.actions = newActions

      return app
    }
  }

  return app
}
