import { createDisplayElements } from './helper';

const defaults = {
  language: 'en-US',
  region: 'eu-west-1',
  sampleRate: 16000,
};

class SettingsManager {
  init() {
    this.manager = document.getElementById('settings-manager');
    this.manager.classList = 'settings-window';

    this.createConfigDisplay();
    this.createStreamingConfigDisplay();
  }

  createConfigDisplay() {
    this.awsConfigDisplay = document.createElement('div', {
      id: 'aws-config',
    });

    createDisplayElements(this.awsConfigDisplay, 'Amazon Config', [
      {
        name: 'Access Key',
        id: 'accessKey',
        type: 'password',
      },
      {
        name: 'Secret Access Key',
        id: 'secretAccessKey',
        type: 'password',
      },
    ]);

    this.manager.appendChild(this.awsConfigDisplay);
  }

  createStreamingConfigDisplay() {
    this.streamingConfigDisplay = document.createElement('div', {
      id: 'streaming-config',
    });

    createDisplayElements(this.streamingConfigDisplay, 'Transcribe Config', [
      {
        name: 'Language',
        id: 'language',
        value: defaults.language,
      },
      {
        name: 'Region',
        id: 'region',
        value: defaults.region,
      },
      {
        name: 'Sample Rate',
        id: 'sampleRate',
        value: defaults.sampleRate,
      },
    ]);

    this.manager.appendChild(this.streamingConfigDisplay);
  }
}

const settingsManager = new SettingsManager();
export default settingsManager;
