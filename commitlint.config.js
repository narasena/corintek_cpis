export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'perf',
        'ci',
        'revert',
      ],
    ], // Strict types only
    'type-case': [2, 'always', 'lower-case'], // Lowercase types
    'type-empty': [2, 'never'], // No empty types
    'subject-empty': [2, 'never'], // No empty subjects
    'subject-case': [0], // Allow sentence case (flexible)
  },
};