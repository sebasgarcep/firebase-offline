// @flow

import type {
  CallbackTools,
  CreateUserWithEmailAndPasswordCallback,
  CommitCallback,
  DetectNetworkChangesCallback,
  FetchCollectionCallback,
  FetchItemCallback,
  LogoutCallback,
  QueryParams,
  DataUploadCallback,
  SignInWithEmailAndPasswordCallback,
  SubscribeCallback,
} from './types';

export default function createWebTools(admin: *): CallbackTools {
  const getRefFromQueryParams = (path: string, params?: ?QueryParams) => {
    let ref = admin.database().ref(path);

    if (!params) return ref;

    if (params.orderByKey) {
      ref = ref.orderByKey();
    }

    if (params.orderByValue) {
      ref = ref.orderByValue();
    }

    if (params.orderByChild) {
      ref = ref.orderByChild(params.orderByChild);
    }

    if (params.startAt) {
      ref = ref.startAt(params.startAt);
    }

    if (params.equalTo) {
      ref = ref.equalTo(params.equalTo);
    }

    if (params.endAt) {
      ref = ref.endAt(params.endAt);
    }

    if (params.limitToFirst) {
      ref = ref.limitToFirst(params.limitToFirst);
    }

    if (params.limitToLast) {
      ref = ref.limitToLast(params.limitToLast);
    }

    return ref;
  };

  const fetchCollection: FetchCollectionCallback = async (path, params, callback) => {
    const ref = getRefFromQueryParams(path, params);

    try {
      const snapshot = await ref.once('value');
      const items = [];
      snapshot.forEach((child) => {
        items.push({ key: child.key, value: child.val() });
      });
      if (callback) callback(null, items);
    } catch (error) {
      if (callback) callback(error);
    }
  };

  const fetchItem: FetchItemCallback = async (path, params, callback) => {
    const ref = getRefFromQueryParams(path, params);

    try {
      const snapshot = await ref.once('value');
      const value = snapshot.val();
      if (callback) callback(null, value);
    } catch (error) {
      if (callback) callback(error);
    }
  };

  const subscribe: SubscribeCallback = (path, eventType, params, callback) => {
    const ref = getRefFromQueryParams(path, params);

    const successCallback = (snapshot) => {
      if (callback) callback(null, { key: snapshot.key, value: snapshot.val() });
    };

    const errorCallback = error => callback && callback(error);

    ref.on(eventType, successCallback, errorCallback);
  };

  const commit: CommitCallback = async (updates, callback) => {
    try {
      await admin.database().ref().update(updates);
      if (callback) callback(null);
    } catch (error) {
      if (callback) callback(error);
    }
  };

  const detectNetworkChanges: DetectNetworkChangesCallback = (statusCallback) => {
    const connectedRef = admin.database().ref('.info/connected');
    connectedRef.on('value', (snapshot) => {
      const status = snapshot.val() === true;
      if (statusCallback) statusCallback({ online: status });
    });
  };

  const dataUpload: DataUploadCallback = async (path, data, callback) => {
    try {
      const storageRef = admin.storage().ref(path);
      await storageRef.putString(data, 'DATA_URL');
      const profilePictureURL = await storageRef.getDownloadURL();
      if (callback) callback(null, profilePictureURL);
    } catch (error) {
      if (callback) callback(error);
    }
  };

  const createUserWithEmailAndPassword: CreateUserWithEmailAndPasswordCallback =
    async (email, password, callback) => {
      try {
        const userRecord = await admin.auth().createUserWithEmailAndPassword(email, password);
        if (callback) callback(null, userRecord);
      } catch (error) {
        if (callback) callback(error);
      }
    };

  const signInWithEmailAndPassword: SignInWithEmailAndPasswordCallback =
    async (email, password, callback) => {
      try {
        const userRecord = await admin.auth().signInWithEmailAndPassword(email, password);
        if (callback) callback(null, userRecord);
      } catch (error) {
        if (callback) callback(error);
      }
    };

  const logout: LogoutCallback = async (callback) => {
    try {
      await admin.auth().signOut();
      if (callback) callback(null);
    } catch (error) {
      if (callback) callback(error);
    }
  };

  return {
    fetchCollection,
    fetchItem,
    subscribe,
    commit,
    dataUpload,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    logout,
    detectNetworkChanges,
  };
}
