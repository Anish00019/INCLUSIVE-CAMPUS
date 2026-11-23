import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
export default [
  { ignores: ['node_modules/**','dist/**','test-results/**'] },
  js.configs.recommended,
  { files:['**/*.{js,jsx,mjs}'], languageOptions:{ecmaVersion:'latest',sourceType:'module',globals:{...globals.browser,...globals.node},parserOptions:{ecmaFeatures:{jsx:true}}},plugins:{react,'react-hooks':hooks},settings:{react:{version:'18.3'}},rules:{
    'no-unused-vars':['warn',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}],
    'react/jsx-uses-vars':'error','react/jsx-key':'error','react/jsx-no-duplicate-props':'error','react/no-unknown-property':'error',
    'react-hooks/rules-of-hooks':'error','react-hooks/exhaustive-deps':'warn',
  } },
];
