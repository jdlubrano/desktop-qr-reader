import jsQR from 'jsqr';
import Store from 'electron-store';
import { shell } from 'electron';
import { isWebUri } from 'valid-url';

import './qr-reader.css';

let video = document.createElement('video');
let canvasElement = document.getElementById("canvas");
let canvas = canvasElement.getContext("2d");
let loadingMessage = document.getElementById("loadingMessage");
let qrData = document.getElementById("qrData");

let openUrls = {};
let videoOptions = null;
let store = new Store();

async function getVideoDevices() {
  let devices = await navigator.mediaDevices.enumerateDevices();

  return devices.filter((device) => {
    return device.kind.match(/video/i);
  });
}

async function getDefaultVideoOptions() {
  let defaultVideoOptions = store.get('videoOptions');
  return defaultVideoOptions || { facingMode: 'environment' };
}

function saveVideoOptions(videoOptions) {
  store.set('videoOptions', videoOptions);
}

async function startVideo() {
  if (videoOptions === null) {
    videoOptions = await getDefaultVideoOptions();
  }

  try {
    hideErrors();

    let stream = await navigator.mediaDevices.getUserMedia({
      video: videoOptions
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.play();

    requestAnimationFrame(tick);
  }
  catch(err) {
    console.log(err);
    showError(`${err.name} ${err.message || ''} ${err.constraint}`);
  }
}

function stopVideo() {
  if (video.srcObject === null) {
    return;
  }

  video.srcObject.getTracks().forEach((track) => track.stop());
  video.srcObject = null;
}

async function showSwitchVideoSourceInterface() {
  let videoDevicesList = document.getElementById('videoDevices');
  videoDevicesList.innerHTML = '';

  let videoDevices = await getVideoDevices();

  videoDevices.forEach((device) => {
    let listItem = document.createElement('li');
    let button = document.createElement('button');
    button.className = 'device-select';

    button.onclick = () => {
      loadingMessage.innerText = "⌛ Loading video..."
      videoDevicesList.parentElement.hidden = true;
      videoOptions = { deviceId: device.deviceId };
      saveVideoOptions(videoOptions);
      startVideo();
    };

    button.innerText = device.label;
    listItem.appendChild(button);
    videoDevicesList.appendChild(listItem);
  });

  videoDevicesList.parentElement.hidden = false;
}

function isUrl(url) {
  return isWebUri(url);
}

async function openUrl(url) {
  if (openUrls[url]) {
    return;
  }

  console.log(`Opening URL ${url}`);
  openUrls[url] = true;

  try {
    await shell.openExternal(url);
  }
  finally {
    setTimeout(() => { delete openUrls[url] }, 2000);
  }
}

function readQrCode(canvas) {
  const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);

  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });

  return code && code.data;
}

function showError(error) {
  let errorMessage = document.getElementById("errorMessage");
  errorMessage.innerText = error;
  errorMessage.parentElement.hidden = false;
}

function hideErrors() {
  document.getElementById("errors").hidden = true;
}

function tick() {
  loadingMessage.innerText = "⌛ Loading video..."

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    loadingMessage.hidden = true;
    canvasElement.hidden = false;
    qrData.hidden = false;

    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    const code = readQrCode(canvas);

    if (code) {
      if (isUrl(code)) {
        hideErrors();
        openUrl(code);
      } else {
        showError(`Found a QR code with data: ${code}, but that is not a valid URL.`);
      }
    } else {
      qrData.innerText = 'No QR code detected';
    }
  }

  requestAnimationFrame(tick);
}

function turnOffVideoWhenHidden() {
  if (document['hidden']) {
    stopVideo();
  } else {
    if (video.srcObject === null) {
      startVideo();
    }
  }
}

document.addEventListener('visibilitychange', turnOffVideoWhenHidden);
document.getElementById('switchVideoSource').onclick = showSwitchVideoSourceInterface;

startVideo(videoOptions);
