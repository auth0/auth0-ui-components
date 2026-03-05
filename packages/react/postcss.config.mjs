const isScoped = process.env.CSS_SCOPE === 'true';

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    ...(isScoped && {
      'postcss-prefix-selector': {
        prefix: '.auth0-universal',
        transform(prefix, selector) {
          // Skip html/body selectors
          if (selector.match(/^(html|body)/)) return selector;
          // Skip nested selectors (&) — parent is already scoped
          if (selector.startsWith('&')) return selector;
          // Skip selectors already scoped to .auth0-universal
          if (selector.startsWith('.auth0-universal')) return selector;
          // :root → .auth0-universal (blocks consumer :root inheritance)
          if (selector === ':root') return prefix;
          // :root, :host → .auth0-universal, .auth0-universal :host
          if (selector === ':host') return `${prefix} :host`;
          // .dark → .auth0-universal.dark (dark mode only inside scope)
          if (selector === '.dark') return `${prefix}.dark`;
          // [data-theme='...'] → .auth0-universal[data-theme='...'] (compound, same element)
          if (selector.match(/^\[data-theme=/)) return `${prefix}${selector}`;
          // All other selectors get prefixed
          return `${prefix} ${selector}`;
        },
      },
    }),
  },
};