;(function(){
function download (dataUrl, filename) {
  var a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
}

let style
function addStyle (css) {
  if (!style) {
    const head = document.querySelector('head')
    style = document.createElement('style')
    head.appendChild(style)
  }
  style.appendChild(document.createTextNode(css))
}

let canvas
setTimeout(() => {
  canvas = document.querySelector('canvas')

  // 当前各大浏览器不支持导出 mp4, 可以先导出 webm 格式, 然后转换格式:
  // ffmpeg -i video.webm video.mp4
  canvas.startRecord = function () {
    const fps = 60
    const filename = 'video.webm'
    const bitrate = 8500000

    const chunks = []
    const mediaStream = this.captureStream(fps)
    this.mediaRecord = new MediaRecorder(mediaStream, {
      videoBitsPerSecond: bitrate
    })
    this.mediaRecord.ondataavailable = (e) => { // 接收数据
      chunks.push(e.data)
    }
    this.mediaRecord.onstop = () => {
      const videoBlob = new Blob(chunks, { 'type' : 'video/webm' })
      const dataUrl = window.URL.createObjectURL(videoBlob)
      download(dataUrl, filename)
    }
    this.mediaRecord.start()
  }

  canvas.stopRecord = function () {
    console.log('stop')
    this.mediaRecord.stop()
  }

  canvas.toggleRecord = function() {
    if (this.isRecording) {
      this.stopRecord()
    } else {
      this.startRecord()
    }
    this.isRecording = !this.isRecording
    return this.isRecording
  }
}, 500)

const btnRecord = document.createElement('button')
btnRecord.innerText = '录制'
btnRecord.classList.add('record')
btnRecord.onclick = function toggleRecord () {
  this.innerText = canvas.toggleRecord() ? '停止' : '录制'
}
addStyle(`
.record {
  position: fixed;
  top: 10px;
  left: 10px;
}`)
document.body.appendChild(btnRecord)
})()
