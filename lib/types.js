// @flow

export type FlowObject = {};

export type NodeCallback<R> = (error?: ?Error, result?: ?R) => any;

export type QueryParams = {
  orderByKey?: ?boolean,
  orderByValue?: ?boolean,
  orderByChild?: ?string,
  startAt?: ?any,
  equalTo?: ?any,
  endAt?: ?any,
  limitToFirst?: ?number,
  limitToLast?: ?number,
};

export type KeyValueItem = {
  key: string,
  value: any,
};

export type FetchCollectionCallback =
  (path: string, params?: ?QueryParams, callback?: ?NodeCallback<Array<KeyValueItem>>) => any;

export type FetchCollectionPromise =
  (path: string, params?: ?QueryParams) => Promise<Array<KeyValueItem>>;

export type FetchItemCallback =
  (path: string, params?: ?QueryParams, callback?: ?NodeCallback<?any>) => any;

export type FetchItemPromise = (path: string, params?: ?QueryParams) => Promise<?any>;

export type EventType =
  | 'value'
  | 'child_added'
  | 'child_changed'
  | 'child_removed';

export type SubscribeCallback =
  (path: string,
   eventType: EventType,
   params?: ?QueryParams,
   callback?: ?NodeCallback<KeyValueItem>) => any;

export type SubscribePromise =
  (path: string,
   eventType: EventType,
   params?: ?QueryParams) => Promise<KeyValueItem>;

export type CommitCallback = (updates: FlowObject, callback?: ?NodeCallback<void>) => any;

export type CommitPromise = (updates: FlowObject) => Promise<void>;

export type DataUploadCallback =
  (path: string,
   data: string, /* base64 */
   callback?: ?NodeCallback<string>) => any;

export type DataUploadPromise =
  (path: string,
   data: string, /* base64 */) => Promise<string>;

export type UserRecord = {
  uid: string,
};

export type CreateUserWithEmailAndPasswordCallback =
  (email: string, password: string, callback?: ?NodeCallback<UserRecord>) => any;

export type CreateUserWithEmailAndPasswordPromise =
  (email: string, password: string) => Promise<UserRecord>;

export type SignInWithEmailAndPasswordCallback = CreateUserWithEmailAndPasswordCallback;
export type SignInWithEmailAndPasswordPromise = CreateUserWithEmailAndPasswordPromise;

export type LogoutCallback = (callback?: ?NodeCallback<void>) => any;
export type LogoutPromise = () => Promise<void>;

export type StatusCallback = (status: { online: boolean }) => any;
export type DetectNetworkChangesCallback = (statusCallback?: ?StatusCallback) => any;

export type StorageInstance = {
  getItem: (key: string, callback?: ?NodeCallback<string>) => any,
  setItem: (key: string, value: string, callback?: ?NodeCallback<void>) => any,
  removeItem: (key: string, callback?: ?NodeCallback<void>) => any,
  getAllKeys: (callback?: ?NodeCallback<Array<string>>) => any,
};

export type PlatformEnum = 'ios' | 'android' | 'web' | 'react-native';

export type CallbackTools = {
  fetchCollection: FetchCollectionCallback,
  fetchItem: FetchItemCallback,
  subscribe: SubscribeCallback,
  commit: CommitCallback,
  dataUpload: DataUploadCallback,
  detectNetworkChanges: DetectNetworkChangesCallback,
  createUserWithEmailAndPassword: CreateUserWithEmailAndPasswordCallback,
  signInWithEmailAndPassword: SignInWithEmailAndPasswordCallback,
  logout: LogoutCallback,
};

export type PromiseTools = {
  fetchCollection: FetchCollectionPromise,
  fetchItem: FetchItemPromise,
  subscribe: SubscribePromise,
  commit: CommitPromise,
  dataUpload: DataUploadPromise,
  detectNetworkChanges: DetectNetworkChangesCallback,
  createUserWithEmailAndPassword: CreateUserWithEmailAndPasswordPromise,
  signInWithEmailAndPassword: SignInWithEmailAndPasswordPromise,
  logout: LogoutPromise,
};

export type Settings = {
  tools: CallbackTools,
  platform: PlatformEnum,
  storage: StorageInstance,
  validate?: FlowObject,
};

export type App = {
  actions: FlowObject,
  reducers: FlowObject,
  selectors: FlowObject,

  middleware: Array<any>,

  settings: {
    platform: PlatformEnum,
    native: boolean,
  },

  // eslint-disable-next-line no-use-before-define
  use: (extension: Extension) => void,

  compile: () => App,
};

export type Extension = (app: App, tools: FlowObject) => any;
