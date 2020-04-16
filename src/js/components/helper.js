export function addInputElements(inputFieldDiv, inputs) {
  for (const input of inputs) {
    const { id, name, type } = input;

    const labelElement = document.createElement('label');
    labelElement.textContent = name;
    inputFieldDiv.appendChild(labelElement);

    const inputElement = document.createElement('input');
    inputElement.id = id;
    inputElement.placeholder = `${name} Here`;
    inputElement.type = type;
    inputFieldDiv.appendChild(inputElement);
  }
}

export function createDisplayElements(displayDiv, name, inputs) {
  const heading = document.createElement('h2');
  heading.innerHTML = name;
  displayDiv.appendChild(heading);

  const inputFieldDiv = document.createElement('div');

  addInputElements(inputFieldDiv, inputs);

  displayDiv.appendChild(inputFieldDiv);
}

export function downsampleBuffer(buffer, sampleRate, outSampleRate) {
  if (outSampleRate === sampleRate) {
    return buffer;
  }
  if (outSampleRate > sampleRate) {
    // throw error
    console.log('down sampling rate show be smaller than original sample rate');
  }
  const sampleRateRatio = sampleRate / outSampleRate;
  const result = new Int16Array(Math.round(buffer.length / sampleRateRatio));
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = Math.min(1, accum / count) * 0x7fff;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result.buffer;
}

export function getAwsConfig() {
  const accessKeyElem = document.getElementById('accessKey');
  const secretAccessKeyElem = document.getElementById('secretAccessKey');

  return {
    accessKeyId: accessKeyElem.value,
    secretAccessKey: secretAccessKeyElem.value,
  };
}

export function getTranscribeConfig() {
  const languageElem = document.getElementById('language');
  const regionElem = document.getElementById('region');

  return {
    language: languageElem.value,
    region: regionElem.value,
  };
}
