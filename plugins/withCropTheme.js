const { withAndroidColors, AndroidConfig } = require('@expo/config-plugins');

const BRAND_PRIMARY = '#C0392B';
const WHITE = '#FFFFFF';
const BLACK = '#000000';

module.exports = function withCropTheme(config) {
  return withAndroidColors(config, (config) => {
    let colors = config.modResults;
    const assign = (name, value) =>
      (colors = AndroidConfig.Colors.assignColorValue(colors, { name, value }));

    assign('expoCropToolbarColor', BRAND_PRIMARY);
    assign('expoCropToolbarIconColor', WHITE);
    assign('expoCropToolbarActionTextColor', WHITE);
    assign('expoCropBackButtonIconColor', WHITE);
    assign('expoCropBackgroundColor', BLACK);

    config.modResults = colors;
    return config;
  });
};
