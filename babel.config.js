module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Required by react-native-reanimated for production builds.
    plugins: ['react-native-reanimated/plugin'],
  };
};
