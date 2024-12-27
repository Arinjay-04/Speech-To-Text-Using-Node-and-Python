const fs = require("fs")
const {exec} = require("child_process")
const mic = require("mic")

const audio_file = 'audio.wav'

const micInstance = mic({
  rate: '16000',                // Audio sample rate
  channels: '1',                // Mono audio
  debug: true,
  fileType: 'wav',              // Audio file format
  device: 'plughw:0,0',         // Default device, change if needed
});



const micInputStream = micInstance.getAudioStream()         // Taking input from mic
const micOutStream = fs.createWriteStream(audio_file)       // Sending audio to audio.wav file


micInputStream.pipe(micOutStream);       //  transfer directly from mic to audio_file

micInputStream.on('startComplete', () => {       // Recording start
  console.log('Recording started...');
});


micInputStream.on('stopComplete', () => {
  console.log('Recording stopped. Processing audio...');

  exec(`python3 whisper_transcribe.py ${audio_file}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during transcription: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Python script stderr: ${stderr}`);
    }
    console.log(`Transcription result:\n${stdout}`);
    console.log('Exiting application...');
    process.exit(0); // Exit cleanly
  });
});

micInputStream.on('error', (error) => {
  console.error('Microphone error:', error.message);
});


micInputStream.on('error', (error) => {
  console.error('Microphone error:', error.message);
});


process.on('SIGINT', () => {
  console.log('\nStopping recording...');
  micInstance.stop();
});

micInstance.start();
console.log('Listening... Press Ctrl+C to stop.');
