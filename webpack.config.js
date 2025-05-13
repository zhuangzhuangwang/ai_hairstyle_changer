module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // 其他规则...
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  // ...
}; 