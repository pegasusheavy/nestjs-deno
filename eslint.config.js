import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      // ===========================================
      // EXPLICIT MEMBER ACCESSIBILITY (REQUIRED)
      // ===========================================
      // Require explicit accessibility modifiers on class members
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public', // Constructors don't need explicit public
          },
        },
      ],

      // ===========================================
      // TYPE SAFETY
      // ===========================================
      // Require explicit return types on functions and methods
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],

      // Enforce consistent type imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // Enforce consistent type exports
      '@typescript-eslint/consistent-type-exports': [
        'error',
        {
          fixMixedExportsWithInlineTypeSpecifier: true,
        },
      ],

      // ===========================================
      // CODE QUALITY
      // ===========================================
      // Disallow unused variables (with exceptions)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Prefer nullish coalescing
      '@typescript-eslint/prefer-nullish-coalescing': [
        'warn',
        {
          ignoreConditionalTests: true,
          ignorePrimitives: true,
        },
      ],

      // Prefer optional chaining
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // No floating promises (must be awaited or voided)
      '@typescript-eslint/no-floating-promises': 'error',

      // Prefer readonly for properties that are never reassigned
      '@typescript-eslint/prefer-readonly': 'warn',

      // Array type style
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],

      // Consistent indexed object style
      '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],

      // ===========================================
      // NAMING CONVENTIONS
      // ===========================================
      '@typescript-eslint/naming-convention': [
        'warn',
        // Interfaces should NOT be prefixed with I
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
        // Type aliases should be PascalCase
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        // Enums should be PascalCase
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        // Class names should be PascalCase
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        // Private members can have leading underscore
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],

      // ===========================================
      // RELAXED RULES
      // ===========================================
      // Allow any in specific cases
      '@typescript-eslint/no-explicit-any': 'warn',

      // Allow non-null assertions where needed
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Allow empty functions (useful for default callbacks)
      '@typescript-eslint/no-empty-function': 'off',

      // Don't require await in async functions (sometimes needed for interface compliance)
      '@typescript-eslint/require-await': 'off',

      // Allow this aliasing (useful in nested functions)
      '@typescript-eslint/no-this-alias': 'off',

      // Allow Function type (needed for compatibility layers)
      '@typescript-eslint/no-unsafe-function-type': 'warn',

      // Allow method shorthand in interfaces (common TypeScript pattern)
      '@typescript-eslint/method-signature-style': 'off',

      // Base ESLint rules
      'no-unused-vars': 'off', // Use TypeScript version
      'no-undef': 'off', // TypeScript handles this
    },
  },
  {
    // Config files have relaxed rules
    files: ['*.config.js', '*.config.ts', '*.config.mjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
    },
  },
  {
    // Test files have relaxed rules
    files: ['**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'benchmark/**',
      'test/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '*.config.ts',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      '*.js',
      '*.mjs',
      '*.cjs',
    ],
  },
);
