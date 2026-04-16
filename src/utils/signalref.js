module.exports = class SignalRef {
  constructor(signal, handler) {
    this.signal = signal;
    this.handler = handler;

    process.on(this.signal, this.handler);

    // This will run a no-op function every 10 seconds.
    // This is to keep the event loop alive, since a
    // signal handler otherwise does _not_. This is the
    // fundamental difference between using `process.on`
    // directly and using a SignalRef instance.
    this.interval = setInterval(() => {}, 10000);
  }

  unref() {
    clearInterval(this.interval);
    process.removeListener(this.signal, this.handler);
  }
};
