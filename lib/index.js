// @flow

// eslint-disable-next-line
import yup from 'yup';
import { key as firebaseKey } from 'firebase-key';
// eslint-disable-next-line
import { applyMiddleware } from 'redux';

import thunk from 'redux-thunk';

/* $FlowFixMe */
import { offline } from '@redux-offline/redux-offline';

import type { App, Extension, StatusCallback } from './types';

import promisifyTools from './promisify-tools';
import validateSettings from './validate-settings';

export default function (settingsDirty: mixed): App {
  const settings = validateSettings(settingsDirty);

  const {
    tools: basicTools,
    platform,
    storage,
    validate,
  } = settings;

  const native = platform === 'ios' || platform === 'android';

  const tools = {
    ...promisifyTools(basicTools),
    generatePushKey: () => firebaseKey(),
    generateTimestamp: () => (new Date()).getTime(),
  };

  const offlineConfig = {
    detectNetwork: (statusCallback: StatusCallback) => {
      tools.detectNetworkChanges(statusCallback);
    },
    effect: (effect/* , action */) => {
      if (!effect.updates) return Promise.resolve(true);
      return tools.commit(effect.updates);
    },
    /*
      in web use localForage
      in react native use AsyncStorage
      in android use ___
      in ios use ___
    */
    persistOptions: {
      storage,
    },
    // eslint-disable-next-line arrow-body-style
    discard: (/* error, action, retries */) => {
      return true;
    },
    retry: (/* action, retries */) => {
      const time = 10/* minutes */ * 60/* seconds */ * 1000/* milliseconds */;
      return time;
    },
  };

  const app = {
    actions: {},
    selectors: {},
    reducers: {},
    middleware: [applyMiddleware(thunk), offline(offlineConfig)],

    settings: {
      platform,
      native,
    },

    use: (extension: Extension) => {
      extension(app, tools);
    },

    compile: () => {
      const newActions = {};

      Object.keys(app.actions).forEach((key) => {
        const config = app.actions[key];

        if (typeof config !== 'object' || config === null) throw new Error();
        if (config.validate && typeof config.validate !== 'object') throw new Error();
        if (config.pre && !Array.isArray(config.pre)) throw new Error();
        if (!config.handler) throw new Error();

        let middleware = [];

        if (config.validate) {
          const schema = yup.object().shape(config.validate);
          const validationCallback = params => (/* dispatch, getState */) =>
            schema.validate(params, validate);

          middleware.push(validationCallback);
        }

        if (config.pre) {
          middleware = middleware.concat(config.pre);
        }

        middleware.push(config.handler);

        newActions[key] = (params = {}) => (dispatch, getState) =>
          middleware.reduce((acc, mid) =>
            acc.then(() => mid(params, tools)(dispatch, getState)), Promise.resolve(true));
      });

      app.actions = newActions;

      return app;
    },
  };

  return app;
}
