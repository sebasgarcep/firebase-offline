// @flow

import type { Settings } from './types';

export default function validateSettings(settingsDirty: mixed = {}): Settings {
  if (settingsDirty === null || typeof settingsDirty !== 'object') {
    throw new Error('You must pass a settings object to \'firebase-offline\' or nothing.');
  }

  const {
    tools,
    platform,
    storage,
    validate,
  } = settingsDirty;

  if (tools === null || typeof tools !== 'object') {
    throw new Error('\'settings.tools\' must be an object.');
  }

  const {
    fetchCollection,
    fetchItem,
    subscribe,
    commit,
    dataUpload,
    detectNetworkChanges,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    logout,
  } = tools;

  if (typeof fetchCollection !== 'function') {
    throw new Error('\'settings.tools.fetch\' must be a functional callback.');
  }

  if (typeof fetchItem !== 'function') {
    throw new Error('\'settings.tools.fetch\' must be a functional callback.');
  }

  if (typeof subscribe !== 'function') {
    throw new Error('\'settings.tools.subsribe\' must be a functional callback.');
  }

  if (typeof commit !== 'function') {
    throw new Error('\'settings.tools.commit\' must be a functional callback.');
  }

  if (typeof dataUpload !== 'function') {
    throw new Error('\'settings.tools.dataUpload\' must be a functional callback.');
  }

  if (typeof detectNetworkChanges !== 'function') {
    throw new Error('\'settings.tools.detectNetworkChanges\' must be a functional callback.');
  }

  if (typeof createUserWithEmailAndPassword !== 'function') {
    throw new Error('\'settings.tools.createUserWithEmailAndPassword\' must be a functional callback.');
  }

  if (typeof signInWithEmailAndPassword !== 'function') {
    throw new Error('\'settings.tools.signInWithEmailAndPassword\' must be a functional callback.');
  }

  if (typeof logout !== 'function') {
    throw new Error('\'settings.tools.logout\' must be a functional callback.');
  }

  if (platform !== 'ios' && platform !== 'android' && platform !== 'web' && platform !== 'react-native') {
    throw new Error('\'settings.platform\' must be either ios, android, web or react-native.');
  }

  if (storage === null || typeof storage !== 'object') {
    throw new Error('\'settings.storage\' must be an object.');
  }

  const { getItem, setItem, removeItem, getAllKeys } = storage;

  if (typeof getItem !== 'function') {
    throw new Error('\'settings.storage.getItem\' must be a functional callback.');
  }

  if (typeof setItem !== 'function') {
    throw new Error('\'settings.storage.setItem\' must be a functional callback.');
  }

  if (typeof removeItem !== 'function') {
    throw new Error('\'settings.storage.removeItem\' must be a functional callback.');
  }

  if (typeof getAllKeys !== 'function') {
    throw new Error('\'settings.storage.getAllKeys\' must be a functional callback.');
  }

  if (validate !== undefined && (validate === null || typeof validate !== 'object')) {
    throw new Error('\'settings.validate\' must be an object.');
  }

  return {
    tools: {
      fetchCollection,
      fetchItem,
      subscribe,
      commit,
      dataUpload,
      detectNetworkChanges,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      logout,
    },
    platform,
    storage: {
      getItem,
      setItem,
      removeItem,
      getAllKeys,
    },
    validate,
  };
}
