module.exports = {
    rootDir: process.cwd(),
    moduleFileExtensions: ['ts', 'js', 'node', 'json'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
    },
    testMatch: ['/**/?(*.)+(spec|e2e).[jt]s?(x)'],
    testEnvironment: 'node',
    collectCoverageFrom: [
        'packages/wallet/src/**/*.[jt]s?(x)',
        '!**/node_modules/**'
    ],
    coverageReporters: ['json', 'html'],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 80,
            lines: 80,
            statements: -10,
        },
    },
    testEnvironment: './jest/env.js',
    moduleNameMapper: {
        '@plugnet/wallet(.*)$': '<rootDir>/packages/wallet/src/$1'
    },
    modulePathIgnorePatterns: [
        '<rootDir>/packages/wallet/build',
    ],
    setupFilesAfterEnv: ['./jest/jest.setup.js']
};
