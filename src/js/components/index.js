import settingsManager from './settings-manager';
import streamingManager from './streaming-manager';

window.onload = async () => {
  console.log('window is loaded');
  settingsManager.init();
  streamingManager.init();
};
