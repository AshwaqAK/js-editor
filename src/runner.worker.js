function serialize(value) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

self.onmessage = async (e) => {
  const code = e.data;
  let logs = [];

  const fakeConsole = {
    log: (...args) =>
      logs.push({ type: "log", payload: args.map(serialize) }),
    warn: (...args) =>
      logs.push({ type: "warn", payload: args.map(serialize) }),
    error: (...args) =>
      logs.push({ type: "error", payload: args.map(serialize) }),
    table: (data) =>
      logs.push({ type: "table", payload: serialize(data) }),
    clear: () => {
      logs = [];
    },
  };

  try {
    // 🔥 ES6+ SAFE EXECUTION
    const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
    const fn = new AsyncFunction("console", code);

    await fn(fakeConsole);

    self.postMessage({ logs });
  } catch (err) {
    // Try to extract line number
    const match = err.stack?.match(/<anonymous>:(\d+):\d+/);

    self.postMessage({
      logs,
      error: {
        message: err.message,
        line: match ? Number(match[1]) : 1,
      },
    });
  }
};
