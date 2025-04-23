module.exports = {
  extends: [
    'react-app'
  ],
  rules: {
    // Désactiver les règles qui peuvent bloquer la compilation
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'no-unused-vars': 'warn',
    'react/prop-types': 'off'
  }
}; 