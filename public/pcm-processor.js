// public/pcm-processor.js

class PcmProcessor extends AudioWorkletProcessor {
// This processor takes the raw float32 audio data from the microphone,
// converts it to 16-bit PCM format, and sends it back to the main thread.
    constructor() {
        super();
        // Store the sample rate for proper playback
        this.sampleRate = sampleRate;
        console.log("PCM Processor initialized with sample rate:", sampleRate);
    }

    process(inputs, outputs, parameters) {
        // The input is an array of channels. We only need the first one.
        const input = inputs[0];
        
        // The channel data is an array of Float32Arrays.
        const channelData = input[0];

        if (!channelData) {
        // No audio data, so we stop processing for this frame.
        return true;
    }

        // Create a 16-bit integer array to hold the PCM data.
    const pcmData = new Int16Array(channelData.length);

        // Convert the float32 samples (from -1.0 to 1.0) to 16-bit integer samples.
    for (let i = 0; i < channelData.length; i++) {
        let sample = channelData[i];
        // Clamp the sample value between -1 and 1
        sample = Math.max(-1, Math.min(1, sample));
        // Convert to 16-bit integer
        pcmData[i] = sample * 32767;
        }

        // Post the raw PCM data back to the main thread.
        // We send the underlying ArrayBuffer for efficiency.
        // Include the sample rate information for proper playback
        this.port.postMessage({
            pcmData: pcmData,
            sampleRate: this.sampleRate
        }, [pcmData.buffer]);

        // Return true to keep the processor alive.
        return true;
    }
}

// Register the processor with the name 'pcm-processor'.
registerProcessor('pcm-processor', PcmProcessor);
