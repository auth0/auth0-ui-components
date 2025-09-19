module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable unused vars warning for JavaScript
    'no-unused-vars': 'off',
    // Allow <a> tags for external links (like Auth0 routes)
    '@next/next/no-html-link-for-pages': 'off',
    // Allow <img> tags for demo purposes
    '@next/next/no-img-element': 'off',
  },
};
