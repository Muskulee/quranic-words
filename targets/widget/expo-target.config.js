/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'WordWidget',
  displayName: 'Word of the Day',
  icon: '../../assets/icon.png',
  deploymentTarget: '17.0',
  colors: {
    $accent: { color: '#0F6B4F', darkColor: '#3FB68B' },
    $widgetBackground: { color: '#F7F5EF', darkColor: '#101412' },
  },
  entitlements: {
    'com.apple.security.application-groups': config.ios.entitlements['com.apple.security.application-groups'],
  },
});
