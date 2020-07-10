const PORT = 5000;

const io = require('socket.io').listen(PORT);
const { AwsTranscribe, StreamingClient } = require('aws-transcribe');

io.on('connection', function (socket) {
  let stream;

  console.log('socket connected ');

  socket.on('start', (config) => {
    console.log('received config', config);

    const client = new AwsTranscribe(config.awsConfig);

    stream = client
      .createStreamingClient({
        region: 'eu-west-1',
        sampleRate: 16000,
        languageCode: 'en-US',
      })
      // enums for returning the event names which the stream will emit
      .on(StreamingClient.EVENTS.OPEN, () => {
        console.log('transcribe connection opened');
      })
      .on(StreamingClient.EVENTS.ERROR, console.error)
      .on(StreamingClient.EVENTS.CLOSE, () => {
        console.log('transcribe connection closed');
      })
      .on(StreamingClient.EVENTS.DATA, (data) => {
        const results = data.Transcript.Results;

        if (!results || results.length === 0) {
          return;
        }

        const result = results[0];
        const final = !result.IsPartial;
        const text = result.Alternatives[0].Transcript;

        const prefix = final ? 'recognized' : 'recognizing';
        console.log(`${prefix} text: ${text}`);

        socket.emit('result', { final, text });
      });
  });

  socket.on('speech_to_text', (audioChunk) => {
    // console.log('sending audio chunk', audioChunk);

    // eslint-disable-next-line no-underscore-dangle
    stream._write(audioChunk, undefined, () => {});
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected ');
    stream.destroy();
    stream.removeAllListeners();
  });
});

console.log(`Socket Server listening on ${PORT}`);
