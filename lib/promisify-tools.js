function getWrappedTool(tool) {
  const numArgs = tool.length - 1;
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

export default function promisifyTools(tools) {
  const promiseTools = {};

  Object.keys(tools).forEach((toolName) => {
    const tool = tools[toolName];

    if (toolName === 'detectNetworkChanges') {
      promiseTools[toolName] = tool;
      return;
    }

    const wrappedTool = getWrappedTool(tool);
    promiseTools[toolName] = wrappedTool;
  });

  return promiseTools;
}
