module.exports = {
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2018,
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        es6: true,
        browser: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:flowtype/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'prettier',
    ],
    plugins: ['import', 'tape', 'react', 'react-hooks', 'flowtype'],
    settings: {
        'import/resolver': {
            node: {
                // Need to explicitly configure extensions to include .jsx files:
                // https://github.com/benmosher/eslint-plugin-import#importextensions
                extensions: ['.js', '.jsx'],
            },
        },
        react: {
            // https://github.com/yannickcr/eslint-plugin-react#configuration
            version: 'detect',
        },
    },
    rules: {
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'tape/no-only-test': 'warn',
        'tape/no-skip-test': 'warn',

        // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-uses-react.md
        'react/jsx-uses-react': 'error',

        // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-uses-vars.md
        'react/jsx-uses-vars': 'error',

        // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-undef.md
        'react/jsx-no-undef': 'error',

        // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-target-blank.md
        'react/jsx-no-target-blank': 'error',

        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
};
