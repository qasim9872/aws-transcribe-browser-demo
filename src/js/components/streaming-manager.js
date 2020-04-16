import { AwsTranscribe } from 'aws-transcribe';
import { downsampleBuffer, getAwsConfig, getTranscribeConfig } from './helper';

const bufferSize = 8192;

const constraints = {
  audio: true,
  video: false,
};

const TheAudioContext =
  window.AudioContext || // Default
  window.webkitAudioContext || // Safari and old versions of Chrome
  false;

// computes the correct navigator
navigator.mediaDevices.getUserMedia =
  navigator.mediaDevices.getUserMedia ||
  navigator.mediaDevices.webkitGetUserMedia ||
  navigator.mediaDevices.mozGetUserMedia;

if (!navigator.mediaDevices) {
  console.warn(
    "Your browser doesn't have the support for media devices.",
    'Please upgrade or change the browser to access media devices'
  );
}

class StreamingManager {
  constructor() {
    this.streaming = false;
    this.context = null;
    this.processor = null;
    this.input = null;
    this.globalStream = null;
    this.recognizedText = [];
  }

  init() {
    this.manager = document.getElementById('streaming-manager');
    this.manager.classList = 'streaming-window';

    const heading = document.createElement('h1');
    heading.innerHTML = 'Streaming';
    this.manager.appendChild(heading);

    this.setupAudioResources();
    this.setupDisplay();
    this.setupButtons();
  }

  setupAudioResources() {
    // create a context which will be used by stt and tts
    this.context = new TheAudioContext({
      latencyHint: 'interactive',
    });
  }

  setupAudioProcessor() {
    // setup the audio processor
    this.processor = this.context.createScriptProcessor(bufferSize, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const buffer = e.inputBuffer.getChannelData(0);

      const pcmBuffer = downsampleBuffer(
        buffer,
        44100,
        this.transcribeConfig.sampleRate
      );

      this.sendAudioBuffer(pcmBuffer);
    };

    // connect the processor to the context
    this.processor.connect(this.context.destination);
  }

  sendAudioBuffer(chunk) {
    // eslint-disable-next-line no-underscore-dangle
    this.transcribeStream._write(chunk);
  }

  async connectToTranscribe() {
    this.awsConfig = getAwsConfig();
    this.transcribeConfig = getTranscribeConfig();

    console.log('aws config', this.awsConfig);
    this.client = new AwsTranscribe(this.awsConfig);

    console.log('client created');

    console.log('aws transcribe config', this.transcribeConfig);
    this.transcribeStream = this.client.createStreamingClient(
      this.transcribeConfig
    );

    this.transcribeStream.on('open', () => {
      console.log('connected');
    });

    this.transcribeStream.on('data', (data) => {
      const results = data.Transcript.Results;

      if (!results || results.length === 0) {
        return;
      }

      const result = results[0];
      const final = !result.IsPartial;
      const prefix = final ? 'recognized' : 'recognizing';
      const text = result.Alternatives[0].Transcript;
      console.log(`${prefix} text: ${text}`);

      this.addTextToDisplay(text, final);
    });

    this.transcribeStream.on('error', (error) => {
      console.log('error occurred', error);
      this.stopStreaming();
      // eslint-disable-next-line no-alert
      alert('transcribe error occurred, view the console for details');
    });

    this.transcribeStream.on('close', (...args) => {
      console.log('closed', ...args);
    });
  }

  addTextToDisplay(text, final) {
    const newTextDisplay = [...this.recognizedText, text].join(' ');
    this.displayText.value = newTextDisplay;

    if (final) {
      this.recognizedText.push(text);
    }
  }

  resetDisplay() {
    this.recognizedText = [];
    this.displayText.value = '';
  }

  async startStreaming() {
    try {
      console.log('start streaming');

      this.resetDisplay();
      await this.connectToTranscribe();

      if (!this.processor) {
        this.setupAudioProcessor();
      }

      if (this.context.state === 'suspended') {
        this.context.resume();
      }

      // create a reference to the stream so we can close it after
      this.globalStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      // setup an input from the stream and connect it to the processor
      this.input = this.context.createMediaStreamSource(this.globalStream);
      this.input.connect(this.processor);

      // Do this at the end so if there is an error, we don't have to disable it again
      this.toggleButtons(true);
    } catch (err) {
      console.log(err);
      // eslint-disable-next-line no-alert
      alert(
        'an error occured while starting the stream, view the console for errors'
      );
    }
  }

  stopStreaming() {
    console.log('stop streaming');
    this.toggleButtons(false);

    // request to stop recognition
    this.globalStream.getTracks()[0].stop();
    this.globalStream = undefined;

    // input needs to be created from the global stream which may change so we can disconnect the last input
    this.input.disconnect(this.processor);
    this.input = undefined;

    // disconnect the processor so there's nothing happening in h
    this.processor.disconnect(this.context.destination);
    this.processor = undefined;

    // close the transcribe connection
    this.transcribeStream.removeAllListeners();
    this.transcribeStream.destroy();
    this.transcribeStream = undefined;
    this.client = undefined;
  }

  toggleButtons(streaming) {
    this.streaming = streaming === undefined ? !this.streaming : streaming;

    if (this.streaming) {
      this.startButton.disabled = true;
      this.stopButton.disabled = false;
    } else {
      this.startButton.disabled = false;
      this.stopButton.disabled = true;
    }
  }

  setupDisplay() {
    this.displayText = document.createElement('textarea');
    this.displayText.id = 'display-text';
    this.displayText.classList = 'display-text-window';
    this.displayText.placeholder = 'Your text will show up here';
    this.displayText.rows = 10;

    this.manager.appendChild(this.displayText);
  }

  setupButtons() {
    this.startButton = document.createElement('button');
    this.startButton.id = 'start-streaming';
    this.startButton.innerText = 'Start';
    this.startButton.classList = 'action-button start';

    this.startButton.addEventListener('click', this.startStreaming.bind(this));

    this.stopButton = document.createElement('button');
    this.stopButton.id = 'stop-streaming';
    this.stopButton.innerText = 'Stop';
    this.stopButton.classList = 'action-button stop';
    this.stopButton.disabled = true;
    this.stopButton.addEventListener('click', this.stopStreaming.bind(this));

    const div = document.createElement('div');
    div.appendChild(this.startButton);
    div.appendChild(this.stopButton);

    this.manager.appendChild(div);
  }
}

const streamingManager = new StreamingManager();
export default streamingManager;
