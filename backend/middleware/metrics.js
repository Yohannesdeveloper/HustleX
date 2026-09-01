const os = require("os");

const metrics = {
  httpRequests: 0,
  httpErrors: 0,
  socketMessages: 0,
  socketErrors: 0,
  startedAt: Date.now(),
};

function metricsMiddleware(req, res, next) {
  metrics.httpRequests += 1;
  res.on("finish", () => {
    if (res.statusCode >= 500) metrics.httpErrors += 1;
  });
  next();
}

function recordSocketMessage() {
  metrics.socketMessages += 1;
}

function recordSocketError() {
  metrics.socketErrors += 1;
}

function getPrometheusMetrics() {
  const mem = process.memoryUsage();
  const uptime = process.uptime();
  const lines = [
    "# HELP hustlex_uptime_seconds Process uptime",
    "# TYPE hustlex_uptime_seconds gauge",
    `hustlex_uptime_seconds ${uptime}`,
    "# HELP hustlex_http_requests_total Total HTTP requests",
    "# TYPE hustlex_http_requests_total counter",
    `hustlex_http_requests_total ${metrics.httpRequests}`,
    "# HELP hustlex_http_errors_total HTTP 5xx responses",
    "# TYPE hustlex_http_errors_total counter",
    `hustlex_http_errors_total ${metrics.httpErrors}`,
    "# HELP hustlex_socket_messages_total Socket messages handled",
    "# TYPE hustlex_socket_messages_total counter",
    `hustlex_socket_messages_total ${metrics.socketMessages}`,
    "# HELP hustlex_memory_heap_used_bytes Heap used",
    "# TYPE hustlex_memory_heap_used_bytes gauge",
    `hustlex_memory_heap_used_bytes ${mem.heapUsed}`,
    "# HELP hustlex_cpu_count CPU cores",
    "# TYPE hustlex_cpu_count gauge",
    `hustlex_cpu_count ${os.cpus().length}`,
  ];
  return lines.join("\n") + "\n";
}

module.exports = {
  metricsMiddleware,
  recordSocketMessage,
  recordSocketError,
  getPrometheusMetrics,
  metrics,
};
