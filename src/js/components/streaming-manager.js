import { downsampleBuffer, getAwsConfig, getTranscribeConfig } from './helper';

const bufferSize = 8192;
const sampleRateHertz = 16000;

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

      const pcmBuffer = downsampleBuffer(buffer, 44100, sampleRateHertz);

      this.sendAudioBuffer(pcmBuffer);
    };

    // connect the processor to the context
    this.processor.connect(this.context.destination);
  }

  sendAudioBuffer(buffer) {
    console.log(`sending audio`);
  }

  async startStreaming() {
    console.log('start streaming');
    this.toggleButtons(true);

    this.awsConfig = getAwsConfig();
    this.transcribeConfig = getTranscribeConfig();

    // TODO - create transcribe client

    if (!this.processor) {
      this.setupAudioProcessor();
    }

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    // create a reference to the stream so we can close it after
    this.globalStream = await navigator.mediaDevices.getUserMedia(constraints);

    // setup an input from the stream and connect it to the processor
    this.input = this.context.createMediaStreamSource(this.globalStream);
    this.input.connect(this.processor);
  }

  stopStreaming() {
    console.log('stop streaming');
    this.toggleButtons(false);

    // request to stop recognition
    this.globalStream.getTracks()[0].stop();
    this.globalStream = null;

    // input needs to be created from the global stream which may change so we can disconnect the last input
    this.input.disconnect(this.processor);
    this.input = null;

    // disconnect the processor so there's nothing happening in h
    this.processor.disconnect(this.context.destination);
    this.processor = null;
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
