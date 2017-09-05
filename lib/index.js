import yup from 'yup';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

import {
  applyMiddleware,
  bindActionCreators,
  combineReducers,
  createStore,
  compose,
} from 'redux';

import thunk from 'redux-thunk';
import { offline } from 'redux-offline';

export default function (settings = {}) {
  const firebaseConfig = settings.firebaseConfig;
  const platform = settings.platform;
  const storage = settings.storage;
  const validationOptions = settings.validate;

  if (!firebaseConfig) {
    throw new Error('\'firebaseConfig\' must be provided.');
  }

  if (!platform) {
    throw new Error('\'platform\' must be provided and be either ios, android, web or react-native.');
  }

  if (!storage) {
    throw new Error('\'storage\' must be provided and possess a confirming redux-persist interface.');
  }

  const native = platform === 'ios' || platform === 'android';

  const admin = firebase.initializeApp(firebaseConfig);
  const connectedRef = admin.database().ref('.info/connected');

  const app = {};

  app.settings = { ...settings, native };

  app.actions = {};
  app.selectors = {};
  app.reducers = {};

  app.use = (callback) => {
    callback(admin, app);
  };

  const commit = updates => admin.database().ref().update(updates);

  const offlineConfig = {
    detectNetwork: (statusCallback) => {
      connectedRef.on('value', (snapshot) => {
        const status = snapshot.val() === true;
        statusCallback(status);
      });
    },
    effect: (effect/* , action */) => {
      if (!effect.updates) {
        return Promise.resolve(true);
      }

      return commit(effect.updates);
    },
    persistOptions: {
      /*
        in web use localForage
        in react native use AsyncStorage
        in android use ___
        in ios use ___
      */
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

  const getActions = () => {
    const actions = {};

    Object.keys(app.actions).forEach((key) => {
      const config = app.actions[key];

      // validations, should use yup FIXME
      if (typeof config !== 'object' || config === null) throw new Error();
      if (config.validate && typeof config.validate !== 'object') throw new Error();
      if (config.pre && !Array.isArray(config.pre)) throw new Error();
      if (!config.handler) throw new Error();

      let middleware = [];

      if (config.validate) {
        const schema = yup.object().shape(config.validate);
        const validationCallback = params => (/* dispatch, getState */) =>
          schema.validate(params, validationOptions);

        middleware.push(validationCallback);
      }

      if (config.pre) {
        middleware = middleware.concat(config.pre);
      }

      middleware.push(config.handler);

      actions[key] = (params = {}) => (dispatch, getState) =>
        middleware.reduce((acc, mid) =>
          acc.then(() => mid(params, commit, admin)(dispatch, getState)), Promise.resolve(true));
    });

    return actions;
  };

  app.getInstance = () => {
    let actions = getActions();
    const middleware = offline(offlineConfig);
    const { reducers, selectors } = app;

    let store;
    if (native) {
      store = createStore(
        combineReducers(reducers),
        {},
        compose(
          applyMiddleware(thunk),
          middleware,
        ),
      );

      actions = bindActionCreators(actions, store.dispatch);
    }

    return {
      actions,
      middleware,
      reducers,
      selectors,
      store,
    };
  };

  return app;
}
