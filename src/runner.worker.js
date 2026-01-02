function serialize(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

self.onmessage = async (e) => {
  const code = e.data;
  let logs = [];

  const fakeConsole = {
    log: (...args) => {
      logs.push({
        type: "log",
        payload: args.map(serialize)
      });
    },

    warn: (...args) => {
      logs.push({
        type: "warn",
        payload: args.map(serialize)
      });
    },

    error: (...args) => {
      logs.push({
        type: "error",
        payload: args.map(serialize)
      });
    },

    table: (data) => {
      logs.push({
        type: "table",
        payload: serialize(data)
      });
    },

    clear: () => {
      logs = [];
    }
  };

  try {
    const fn = new Function("console", `
      return (async () => {
        ${code}
      })();
    `);

    await fn(fakeConsole);
    self.postMessage({ logs });
  } catch (err) {
    self.postMessage({
      logs: [{ type: "error", payload: [err.stack] }]
    });
  }
};
