// Backend/middleware/layoutMiddleware.js

/**
 * EJS Layout Middleware
 * This middleware intercepts res.render() to wrap page content with layout.ejs
 */

export const layoutMiddleware = (req, res, next) => {
  const originalRender = res.render;

  res.render = function (view, options = {}) {
    const { layout = 'layout', ...otherOptions } = options;

    if (layout) {
      // Render the page content first
      originalRender.call(this, view, { ...otherOptions, layout: false }, (err, html) => {
        if (err) return next(err);

        // Then render the layout with the page content
        originalRender.call(this, layout, {
          ...otherOptions,
          body: html,
        });
      });
    } else {
      // No layout, render directly
      originalRender.call(this, view, otherOptions);
    }
  };

  next();
};