import settingsManager from './settings-manager';

window.onload = async () => {
  console.log('window is loaded');
  settingsManager.init();
};
