import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'scripts'] },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // La app sincroniza datos remotos (Overpass, barrios SIUBEN) con el
      // patrón clásico fetch-en-efecto + reset síncrono al cambiar de
      // provincia. Sin librería de queries, ese setState inicial del efecto
      // es intencional (limpia datos de la ciudad anterior).
      'react-hooks/set-state-in-effect': 'off',
    },
  },
);
