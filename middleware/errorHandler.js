export function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "23505") {
    return res.status(409).json({ error: "A record with this value already exists." });
  }
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced record does not exist." });
  }

  const status = err.status || 500;
  // TEMPORARY: expose full error details for debugging — revert after fixing
  res.status(status).json({
    error: err.message || "Something went wrong on the server.",
    name: err.name || null,
    code: err.code || null,
    stack: err.stack || null,
  });
}