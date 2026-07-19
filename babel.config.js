module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'transform-inline-environment-variables',
      {
        include: ['GOOGLE_WEB_CLIENT_ID'] 
      }
    ]
  ],
};
