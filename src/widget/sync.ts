import { Appearance, Platform } from 'react-native';
import { ExtensionStorage } from '@bacons/apple-targets';
import { requestWidgetUpdate, type WidgetTaskHandler } from 'react-native-android-widget';
import { AndroidWordWidget } from './AndroidWordWidget';
import { getProgress } from '../lib/progress';
import { wordOfTheDay } from '../lib/words';

export const APP_GROUP = 'group.com.muskulee.quranicwords';
export const ANDROID_WIDGET = 'WordOfDay';

function renderAndroid() {
  return AndroidWordWidget({ word: wordOfTheDay(), lang: getProgress().lang, dark: Appearance.getColorScheme() === 'dark' });
}

/** Push the user's meaning language to the widgets and ask them to redraw. */
export function syncWidgets() {
  try {
    if (Platform.OS === 'ios') {
      new ExtensionStorage(APP_GROUP).set('lang', getProgress().lang);
      ExtensionStorage.reloadWidget('WordWidget');
    } else if (Platform.OS === 'android') {
      requestWidgetUpdate({ widgetName: ANDROID_WIDGET, renderWidget: renderAndroid });
    }
  } catch {
    // Widgets are optional; never let them break the app.
  }
}

/** Android calls this headlessly when a widget is added, resized or its update period elapses. */
export const widgetTaskHandler: WidgetTaskHandler = async ({ widgetInfo, widgetAction, renderWidget }) => {
  if (widgetInfo.widgetName !== ANDROID_WIDGET) return;
  if (widgetAction === 'WIDGET_ADDED' || widgetAction === 'WIDGET_UPDATE' || widgetAction === 'WIDGET_RESIZED') {
    renderWidget(renderAndroid());
  }
};
