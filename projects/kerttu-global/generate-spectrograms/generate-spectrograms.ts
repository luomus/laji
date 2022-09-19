/**
 * This script can be used to generate spectrogram images from mp3 audio recordings.
 **/

const inputFolder = 'input';
const outputFolder = 'output';
const imageWidth = 1500;
const imageHeight = 80;

import * as fs from 'fs';
import { Lame } from 'node-lame';
// @ts-ignore
import audioDecode from 'audio-decode';
import { ImageData, createCanvas } from 'node-canvas';
import resizeImageData from 'resize-image-data';
import { getSpectrogramImageData } from '../../laji/src/app/shared-modules/audio-viewer/service/spectrogram';
import { defaultAudioSampleRate } from '../src/app/kerttu-global-shared/variables';

global.ImageData = ImageData;

function drawImage(data: ImageData, sampleRate: number, filename: string) {
  const ratioY2 = defaultAudioSampleRate / sampleRate;
  const resizedData = resizeImageData(data, imageWidth, Math.ceil(imageHeight / ratioY2), 'bilinear-interpolation');
  const startY = resizedData.height - (resizedData.height * ratioY2);

  data = new ImageData(resizedData.data, resizedData.width, resizedData.height);
  const canvas = createCanvas(data.width, data.height * ratioY2);
  const ctx = canvas.getContext('2d');
  ctx.putImageData(data, 0, -startY, 0, startY, canvas.width, canvas.height);

  const out = fs.createWriteStream(outputFolder + '/' + filename.replace('.mp3', '.jpg'));
  const stream = canvas.createJPEGStream({ quality: 0.90 });
  stream.pipe(out);
  out.on('finish', () =>  processNextFile());
}

function processNextFile() {
  const filename = dirContents.shift();
  if (!filename) {
    return;
  }
  if (fs.existsSync(outputFolder + '/' + filename.replace('.mp3', '.jpg'))) {
    processNextFile();
  } else {
    const decoder = new Lame({
      output: 'buffer',
      mp3Input: true
    }).setFile(inputFolder + '/' + filename);

    decoder
      .decode()
      .then(() => {
        const buffer = decoder.getBuffer();
        audioDecode(buffer).then((audioBuffer: any) => {
          const imageData = getSpectrogramImageData(audioBuffer, colorMap);
          drawImage(imageData, audioBuffer.sampleRate, filename);
        }, (err: any) => {
          console.log('Error while processing file ' + filename + ': ' + err);
        });
      })
      .catch((err) => {
        console.log('Error while decoding file ' + filename + ': ' + err);
      });
  }
}

if (!fs.existsSync(outputFolder)){
  fs.mkdirSync(outputFolder);
}
const colorMap = JSON.parse(fs.readFileSync('../../laji/src/static/audio/viridis-colormap.json') as any);
const dirContents = fs.readdirSync(inputFolder);
processNextFile();
