import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	...svelte.configs['flat/prettier'],
	{
		ignores: ['.svelte-kit/', 'build/', 'dist/']
	},
	{
		languageOptions: {
			parser: svelte.parser,
			parserOptions: {
				parser: ts.parser
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	}
];
