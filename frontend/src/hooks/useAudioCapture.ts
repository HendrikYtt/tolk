import { useState, useRef, useCallback } from 'react';

interface AudioCaptureOptions {
    sampleRate?: number;
    onAudioData: (pcmData: ArrayBuffer) => void;
}

export const useAudioCapture = ({ sampleRate = 16000, onAudioData }: AudioCaptureOptions) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCapture = useCallback(async () => {
        try {
            setError(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            streamRef.current = stream;

            // Create AudioContext at default sample rate to avoid Firefox sample rate mismatch
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const inputSampleRate = audioContext.sampleRate;

            // Use ScriptProcessorNode (deprecated but widely supported)
            // AudioWorklet would be better but requires more setup
            const processor = audioContext.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (event) => {
                const inputData = event.inputBuffer.getChannelData(0);

                // Resample from input rate to target rate if needed
                let samples: Float32Array;
                if (inputSampleRate !== sampleRate) {
                    const ratio = inputSampleRate / sampleRate;
                    const newLength = Math.floor(inputData.length / ratio);
                    samples = new Float32Array(newLength);
                    for (let i = 0; i < newLength; i++) {
                        samples[i] = inputData[Math.floor(i * ratio)];
                    }
                } else {
                    samples = inputData;
                }

                // Convert Float32 to PCM16
                const pcm16 = new Int16Array(samples.length);
                for (let i = 0; i < samples.length; i++) {
                    const s = Math.max(-1, Math.min(1, samples[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
                }

                onAudioData(pcm16.buffer);
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            // Store processor reference for cleanup
            workletNodeRef.current = processor as unknown as AudioWorkletNode;

            setIsCapturing(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to access microphone';
            setError(message);
        }
    }, [sampleRate, onAudioData]);

    const stopCapture = useCallback(() => {
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        setIsCapturing(false);
    }, []);

    return {
        isCapturing,
        error,
        startCapture,
        stopCapture,
    };
};
