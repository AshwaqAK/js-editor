function serialize(value) {
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/* ===================== LOOP GUARD ===================== */
function injectLoopGuard(code) {
  return `
let __loopCount = 0;
const __checkLoop = () => {
  if (++__loopCount > 1e6) {
    throw new Error("❌ Infinite loop detected");
  }
};

${code.replace(/for\s*\(|while\s*\(|do\s*\{/g, (m) => {
    if (m.startsWith("do")) return `${m} __checkLoop();`;
    return `${m}__checkLoop(),`;
  })}
`;
}

/* ===================== WORKER ===================== */
self.onmessage = async (e) => {
  const code = e.data;
  let logs = [];
  let timeoutId;

  const fakeConsole = {
    log: (...args) => logs.push({ type: "log", payload: args.map(serialize) }),

    warn: (...args) => logs.push({ type: "warn", payload: args.map(serialize) }),

    error: (...args) => logs.push({ type: "error", payload: args.map(serialize) }),

    table: (data) => logs.push({ type: "table", payload: serialize(data) }),

    clear: () => {
      logs = [];
    }
  };

  try {
    /* ===== Execution timeout ===== */
    timeoutId = setTimeout(() => {
      throw new Error("⏱ Execution timed out");
    }, 2000);

    const protectedCode = injectLoopGuard(code);

    const fn = new Function(
      "console",
      `
      return (async () => {
        ${protectedCode}
      })();
    `
    );

    await fn(fakeConsole);

    clearTimeout(timeoutId);
    self.postMessage({ logs });
  } catch (err) {
    clearTimeout(timeoutId);
    self.postMessage({
      logs: [
        {
          type: "error",
          payload: [err.message || err.toString()],
        },
      ],
    });
  }
};
