export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-prefix-selector': {
      prefix: '.auth0',
      transform(prefix, selector) {
        if (selector.match(/^(html|body|:root|\.dark)/)) return selector;
        return `${prefix} ${selector}`;
      }
    },
  },
};
