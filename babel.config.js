const isTest = process.env.NODE_ENV === 'test'

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/react',
    '@babel/typescript',
  ],
  plugins: isTest
    ? [
        {
          // react-router v8 is ESM-only and uses `import.meta`,
          // which is unavailable in jest's CommonJS transform.
          visitor: {
            MetaProperty(path) {
              path.replaceWithSourceString('({})')
            },
          },
        },
      ]
    : [],
}
