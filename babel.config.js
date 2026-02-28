module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'transform-inline-environment-variables',
      {
        include: ['GOOGLE_WEB_CLIENT_ID'] 
      }
    ]
  ],
};
