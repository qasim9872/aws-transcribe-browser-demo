class StreamingManager {
  init() {
    this.manager = document.getElementById('streaming-manager');
    this.manager.classList = 'streaming-window';

    const heading = document.createElement('h1');
    heading.innerHTML = 'Streaming';
    this.manager.appendChild(heading);

    this.setupDisplay();
    this.setupButtons();
  }

  setupDisplay() {
    this.displayText = document.createElement('textarea', {
      id: 'display-text',
    });
    this.displayText.classList = 'display-text-window';
    this.displayText.placeholder = 'Your text will show up here';
    this.displayText.rows = 10;

    this.manager.appendChild(this.displayText);
  }

  setupButtons() {
    this.startButton = document.createElement('button', {
      id: 'start-streaming',
    });
    this.startButton.innerText = 'Start';
    this.startButton.classList = 'action-button start';

    this.stopButton = document.createElement('button', {
      id: 'stop-streaming',
    });
    this.stopButton.innerText = 'Stop';
    this.stopButton.classList = 'action-button stop';
    this.stopButton.disabled = true;

    const div = document.createElement('div');
    div.appendChild(this.startButton);
    div.appendChild(this.stopButton);

    this.manager.appendChild(div);
  }
}

const streamingManager = new StreamingManager();
export default streamingManager;
