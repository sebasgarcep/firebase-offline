// @flow

import type { CallbackTools, PromiseTools } from './types';

/* $FlowFixMe */
export default function promisifyTools(tools: CallbackTools): PromiseTools {
  const promiseTools = {};

  Object.keys(tools).forEach((toolName) => {
    const tool: any = tools[toolName];

    if (toolName === 'detectNetworkChanges') {
      promiseTools[toolName] = tool;
      return;
    }

    const wrappedTool = (...args) => new Promise((resolve, reject) => {
      const callback = (error, result) => {
        if (error === null) return resolve(result);
        return reject(error);
      };

      tool(...args, callback);
    });

    promiseTools[toolName] = wrappedTool;
  });

  return promiseTools;
}
