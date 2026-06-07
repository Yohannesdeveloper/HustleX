/** Socket.IO instance registry (set from server.js, read from queue workers). */
let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  return ioInstance;
}

module.exports = { setIO, getIO };
