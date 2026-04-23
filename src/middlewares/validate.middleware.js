const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body;
    req.query = parsed.query;
    req.params = parsed.params;
    next();
  } catch (err) {
    if (err.name === 'ZodError') {
      const issues = err.issues || err.errors || [];
      const message = issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(new ApiError(400, message));
    }
    next(err);
  }
};

module.exports = validate;
