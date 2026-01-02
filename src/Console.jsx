export default function Console({ logs }) {
  if (!logs.length) {
    return <div className="console console-empty">Console is empty</div>;
  }

  return (
    <div className="console">
      {logs.map((log, i) => (
        <div key={i} className={`console-entry console-${log.type}`}>
          {log.payload.join(" ")}
        </div>
      ))}
    </div>
  );
}
