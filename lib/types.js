// @flow

export type FlowObject = {};

export type NodeCallback<R> = (error: ?Error, result: ?R) => any;

export type QueryParams = {
  path: string,
  orderByKey?: ?boolean,
  orderByValue?: ?boolean,
  orderByChild?: ?boolean,
  startAt?: ?any,
  equalTo?: ?any,
  endAt?: ?any,
  limitToFirst?: ?number,
  limitToLast?: ?number,
};

export type FetchCallback =
  (params: QueryParams, callback?: ?NodeCallback<any>) => any;

export type SubscribeCallback =
  (params: QueryParams, callback?: ?NodeCallback<any>) => any;

export type CommitCallback = (updates: FlowObject, callback?: NodeCallback<void>) => any;

export type StatusCallback = (status: boolean) => any;
export type DetectNetworkChangesCallback = (statusCallback?: ?StatusCallback) => any;

export type StorageInstance = {
  getItem: (key: string, callback?: ?NodeCallback<string>) => any,
  setItem: (key: string, value: string, callback?: ?NodeCallback<void>) => any,
  removeItem: (key: string, callback?: ?NodeCallback<void>) => any,
  getAllKeys: (callback?: ?NodeCallback<Array<string>>) => any,
};

export type PlatformEnum = 'ios' | 'android' | 'web' | 'react-native';

export type Settings = {
  fetch: FetchCallback,
  subscribe: SubscribeCallback,
  commit: CommitCallback,
  detectNetworkChanges: DetectNetworkChangesCallback,
  platform: PlatformEnum,
  storage: StorageInstance,
  validate?: FlowObject,
};

export type Tools = {
  fetch: FetchCallback,
  subscribe: SubscribeCallback,
  commit: CommitCallback,
};

export type App = {
  actions: FlowObject,
  reducers: FlowObject,
  selectors: FlowObject,

  middleware: Array<any>,
  store: any,

  settings: {
    platform: PlatformEnum,
    native: boolean,
  },

  // eslint-disable-next-line no-use-before-define
  use: (extension: Extension) => void,

  compile: () => void,
};

export type Extension = (app: App, tools: Tools) => any;
