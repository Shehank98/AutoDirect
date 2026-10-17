// Tiny fixed-window rate limiter for public form endpoints (in memory, per client IP).
// Keeps bots from filling the inquiries / newsletter tables. Not meant for multi-instance setups.
function rateLimit({ windowMs, max, message }) {
  const hits = new Map();
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (now - v.first > windowMs) hits.delete(k); }, windowMs).unref();
  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const h = hits.get(key);
    if (!h || now - h.first > windowMs) { hits.set(key, { n: 1, first: now }); return next(); }
    h.n += 1;
    if (h.n > max) {
      res.set('Retry-After', String(Math.ceil((h.first + windowMs - now) / 1000)));
      return res.status(429).json({ error: message || 'Too many requests. Please try again in a few minutes.' });
    }
    next();
  };
}
module.exports = rateLimit;
