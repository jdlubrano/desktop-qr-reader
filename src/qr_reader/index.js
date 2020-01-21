import jsQR from 'jsqr';
import shell from 'electron';
import { isWebUri } from 'valid-url';

import './qr-reader.css';

var video = document.createElement('video');
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");
var loadingMessage = document.getElementById("loadingMessage");
var qrData = document.getElementById("qrData");

var openUrls = {};

function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.play();
    requestAnimationFrame(tick);
  });
}

function stopCamera() {
  video.srcObject.getTracks().forEach((track) => track.stop());
  video.srcObject = null;
}

function isUrl(url) {
  return isWebUri(url);
}

function openUrl(url) {
  if (openUrls[url]) {
    return;
  }

  console.log(`Opening URL ${url}`);
  openUrls[url] = true;

  shell.openExternal(url).finally(() => {
    setTimeout(() => { delete openUrls[url] }, 1000);
  });
}

function readQrCode(canvas) {
  const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);

  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });

  return code && code.data;
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
      // drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
      // drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
      // drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
      // drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");

      if (isUrl(code)) {
        document.getElementById("errors").hidden = true;
        openUrl(code);
      } else {
        var errorMessage = document.getElementById("errorMessage");
        errorMessage.innerText = `Found a QR code with data: ${code}, but that is not a valid URL.`;
        errorMessage.parentElement.hidden = false;
      }
    } else {
      qrData.innerText = 'No QR code detected';
    }
  }

  requestAnimationFrame(tick);
}

function turnOffCameraWhenHidden() {
  if (document['hidden']) {
    stopCamera();
  } else {
    if (video.srcObject === null) {
      startCamera();
    }
  }
}

document.addEventListener('visibilitychange', turnOffCameraWhenHidden);

startCamera();
