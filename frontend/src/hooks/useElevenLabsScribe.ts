import { useState, useRef, useCallback, useEffect } from 'react';

interface UseElevenLabsScribeOptions {
    getToken: () => Promise<string>;
    languageCode?: string;
    onPartialTranscript: (text: string) => void;
    onCommittedTranscript: (text: string) => void;
    onError: (error: string) => void;
}

interface ElevenLabsMessage {
    message_type: string;
    text?: string;
    error?: string;
}

export const useElevenLabsScribe = ({
    getToken,
    languageCode = 'en',
    onPartialTranscript,
    onCommittedTranscript,
    onError,
}: UseElevenLabsScribeOptions) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    // Use refs for callbacks to avoid stale closures in WebSocket handlers
    const onPartialTranscriptRef = useRef(onPartialTranscript);
    const onCommittedTranscriptRef = useRef(onCommittedTranscript);
    const onErrorRef = useRef(onError);

    // Keep refs updated
    onPartialTranscriptRef.current = onPartialTranscript;
    onCommittedTranscriptRef.current = onCommittedTranscript;
    onErrorRef.current = onError;

    const connect = useCallback(async () => {
        if (wsRef.current?.readyState === WebSocket.OPEN || isConnecting) {
            return;
        }

        setIsConnecting(true);

        try {
            // Fetch single-use token from backend
            const token = await getToken();

            // Build WebSocket URL with query parameters
            const params = new URLSearchParams({
                model_id: 'scribe_v2_realtime',
                language_code: languageCode,
                audio_format: 'pcm_16000',
                token,
                // Enable VAD-based automatic commits
                commit_strategy: 'vad',
                vad_silence_threshold_secs: '1',
            });
            const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params}`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                setIsConnecting(false);
            };

            ws.onmessage = (event) => {
                try {
                    const message: ElevenLabsMessage = JSON.parse(event.data);

                    switch (message.message_type) {
                        case 'partial_transcript':
                            if (message.text) {
                                onPartialTranscriptRef.current(message.text);
                            }
                            break;
                        case 'committed_transcript':
                        case 'committed_transcript_with_timestamps':
                        case 'final_transcript':
                        case 'transcript':
                            if (message.text) {
                                onCommittedTranscriptRef.current(message.text);
                            }
                            break;
                        case 'error':
                        case 'auth_error':
                        case 'quota_exceeded':
                        case 'rate_limited':
                        case 'invalid_request':
                            onErrorRef.current(message.error || 'Unknown error');
                            break;
                    }
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err);
                }
            };

            ws.onerror = () => {
                setIsConnecting(false);
                onErrorRef.current('WebSocket connection error');
            };

            ws.onclose = () => {
                setIsConnected(false);
                setIsConnecting(false);
            };
        } catch (err) {
            setIsConnecting(false);
            onErrorRef.current(err instanceof Error ? err.message : 'Failed to get token');
        }
    }, [getToken, languageCode, isConnecting]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const sendAudioChunk = useCallback((audioData: ArrayBuffer) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            // Convert ArrayBuffer to base64
            const bytes = new Uint8Array(audioData);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64Audio = btoa(binary);

            wsRef.current.send(
                JSON.stringify({
                    message_type: 'input_audio_chunk',
                    audio_base_64: base64Audio,
                })
            );
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        isConnecting,
        connect,
        disconnect,
        sendAudioChunk,
    };
};
