class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) {
      return true;
    }
    const channel = input[0];
    
    // Convert the Float32Array to Int16Array.
    const int16 = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
      // The input is in the range of [-1, 1], so we multiply by the max value of a 16-bit signed integer.
      int16[i] = Math.max(-32768, Math.min(32767, channel[i] * 32768));
    }
    
    // Post the raw PCM data back to the main thread.
    this.port.postMessage(int16, [int16.buffer]);
    
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
