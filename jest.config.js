module.exports = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 79,
      functions: 94,
      lines: 78,
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
