export function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  // Postgres unique-violation
  if (err.code === "23505") {
    return res.status(409).json({ error: "A record with this value already exists." });
  }
  // Postgres foreign-key violation
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced record does not exist." });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Something went wrong on the server." });
}
