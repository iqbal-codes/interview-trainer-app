/**
 * Creates a WAV file blob from raw PCM audio data.
 * This function constructs a 44-byte WAV header and prepends it to the PCM data,
 * creating a valid WAV file in memory that can be decoded by the Web Audio API.
 *
 * @param {ArrayBuffer} pcmData The raw 16-bit PCM audio data received from the API.
 * @param {number} sampleRate The sample rate of the audio (e.g., 24000 for Gemini).
 * @returns {Blob} A blob object representing the complete WAV file.
 */
export function pcmToWav(pcmData: ArrayBuffer, sampleRate: number) {
  const pcm16 = new Int16Array(pcmData);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcm16.byteLength, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 1 * 2, true); // ByteRate = SampleRate * NumChannels * BitsPerSample/8
  view.setUint16(32, 2, true); // BlockAlign = NumChannels * BitsPerSample/8
  view.setUint16(34, 16, true); // BitsPerSample

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcm16.byteLength, true); // Subchunk2Size

  // Return a single Blob containing the header and the PCM data
  return new Blob([view, pcm16], { type: 'audio/wav' });
}

/**
 * Helper function to write a string to a DataView.
 * @param {DataView} view The DataView to write to.
 * @param {number} offset The offset to start writing at.
 * @param {string} string The string to write.
 */
export function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// --- Helper function to downsample audio to 16kHz for Gemini API ---
export const downsampleTo16kHz = (buffer: Int16Array, originalSampleRate: number): Int16Array => {
  // Skip if already at target rate
  if (originalSampleRate === 16000) {
    return buffer;
  }

  // Calculate resample ratio
  const ratio = 16000 / originalSampleRate;
  const outputLength = Math.floor(buffer.length * ratio);
  const output = new Int16Array(outputLength);

  // Simple linear interpolation downsampling
  for (let i = 0; i < outputLength; i++) {
    const position = i / ratio;
    const index = Math.floor(position);
    const fraction = position - index;

    if (index >= buffer.length - 1) {
      output[i] = buffer[buffer.length - 1];
    } else {
      const sample1 = buffer[index];
      const sample2 = buffer[index + 1];
      output[i] = Math.round(sample1 + fraction * (sample2 - sample1));
    }
  }

  return output;
};

// --- Helper function to convert Int16Array to base64 string ---
export const int16ArrayToBase64 = (int16Array: Int16Array): string => {
  // Create a Uint8Array view of the Int16Array's buffer
  const uint8Array = new Uint8Array(
    int16Array.buffer,
    int16Array.byteOffset,
    int16Array.byteLength
  );

  // Convert to base64
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binaryString);
};

// --- More efficient base64 to ArrayBuffer conversion ---
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  // Use a faster loop structure
  let i = binaryString.length;
  while (i--) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};
