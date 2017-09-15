// @flow

import type { CallbackTools, PromiseTools } from './types';

function getWrappedTool(tool: *, numArgs: number) {
  const wrappedTool = (...args) => new Promise((resolve, reject) => {
    const callback = (error, result) => {
      if (error === null) return resolve(result);
      return reject(error);
    };

    const realArgs = [...args];
    while (realArgs.length < numArgs) {
      realArgs.push(undefined);
    }

    tool(...realArgs, callback);
  });

  return wrappedTool;
}

/* $FlowFixMe */
export default function promisifyTools(tools: CallbackTools): PromiseTools {
  const promiseTools = {};

  Object.keys(tools).forEach((toolName) => {
    const tool: any = tools[toolName];

    if (toolName === 'detectNetworkChanges') {
      promiseTools[toolName] = tool;
      return;
    }

    let numArgs;
    switch (toolName) {
      case 'commit':
        numArgs = 1;
        break;

      case 'fetchCollection':
      case 'fetchItem':
      case 'dataUpload':
      case 'createUserWithEmailAndPassword':
      case 'signInWithEmailAndPassword':
        numArgs = 2;
        break;

      case 'subscribe':
        numArgs = 3;
        break;

      case 'logout':
      default:
        numArgs = 0;
        break;
    }

    const wrappedTool = getWrappedTool(tool, numArgs);

    promiseTools[toolName] = wrappedTool;
  });

  return promiseTools;
}
