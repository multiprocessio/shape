module.exports = {
  coverageThreshold: {
    global: {
      statements: 89,
      branches: 89,
      functions: 100,
      lines: 88,
    },
  },
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
  collectCoverageFrom: ['**/*.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
