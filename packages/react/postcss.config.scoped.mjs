export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-prefix-selector': {
      prefix: '.auth0',
      transform(prefix, selector) {
        // Keep html and body unprefixed
        if (selector.match(/^(html|body)/)) return selector;

        // For :root and .dark, output both unprefixed AND prefixed versions
        // This makes variables available globally AND within .auth0 scope
        if (selector.match(/^(:root|\.dark)/)) {
          return `${selector}, ${prefix}${selector.replace(':root', '')}`;
        }

        return `${prefix} ${selector}`;
      }
    },
  },
};
