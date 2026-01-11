import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Select } from '../components/ui';
import { useAudioCapture, useElevenLabsScribe } from '../hooks';
import { TRANSLATE_API, ELEVENLABS_API } from '../api';
import { SUPPORTED_SOURCE_LANGUAGES, SUPPORTED_TARGET_LANGUAGES } from '@tolk/shared';

interface TranscriptSegment {
    text: string;
    translation?: string;
    timestamp: number; // seconds from start
}

const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const capitalize = (text: string): string => {
    if (!text) {
        return text;
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export const TranscriberPage = () => {
    // Language selection
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('ES');

    // Transcription state
    const [partialTranscript, setPartialTranscript] = useState('');
    const [segments, setSegments] = useState<TranscriptSegment[]>([]);
    const [isTranslating, setIsTranslating] = useState(false);

    // Recording start time for timestamps
    const recordingStartRef = useRef<number>(0);

    // Translate a specific segment by index
    const translateSegment = useCallback(
        async (segmentIndex: number, text: string) => {
            if (!text.trim()) {
                return;
            }

            setIsTranslating(true);
            try {
                const result = await TRANSLATE_API.translate({
                    text,
                    sourceLang: sourceLang !== 'auto' ? sourceLang : undefined,
                    targetLang,
                });
                setSegments((prev) =>
                    prev.map((seg, i) =>
                        i === segmentIndex ? { ...seg, translation: result.translatedText } : seg
                    )
                );
            } catch (err) {
                console.error('[translate] error:', err);
                toast.error('Translation failed');
            } finally {
                setIsTranslating(false);
            }
        },
        [sourceLang, targetLang]
    );

    // Get token callback for ElevenLabs
    const getElevenLabsToken = useCallback(async () => {
        const response = await ELEVENLABS_API.getToken();
        return response.token;
    }, []);

    // ElevenLabs Scribe hook
    const { isConnected: _isConnected, connect, disconnect, sendAudioChunk } = useElevenLabsScribe({
        getToken: getElevenLabsToken,
        languageCode: sourceLang,
        onPartialTranscript: (text) => {
            setPartialTranscript(text);
        },
        onCommittedTranscript: (text) => {
            if (!text.trim()) {
                return;
            }
            const timestamp = (Date.now() - recordingStartRef.current) / 1000;
            setSegments((prev) => {
                const newIndex = prev.length;
                translateSegment(newIndex, text);
                return [...prev, { text, timestamp }];
            });
            setPartialTranscript('');
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    // Audio capture hook
    const { isCapturing, error: audioError, startCapture, stopCapture } = useAudioCapture({
        sampleRate: 16000,
        onAudioData: sendAudioChunk,
    });

    // Show audio errors
    useEffect(() => {
        if (audioError) {
            toast.error(audioError);
        }
    }, [audioError]);

    // Handle start/stop recording
    const handleToggleRecording = useCallback(async () => {
        if (isCapturing) {
            stopCapture();
            disconnect();
        } else {
            // Clear previous session
            setSegments([]);
            setPartialTranscript('');
            recordingStartRef.current = Date.now();

            connect();
            await startCapture();
        }
    }, [isCapturing, startCapture, stopCapture, connect, disconnect]);


    const sourceOptions = SUPPORTED_SOURCE_LANGUAGES.map((lang) => ({
        value: lang.code,
        label: lang.name,
    }));

    const targetOptions = SUPPORTED_TARGET_LANGUAGES.map((lang) => ({
        value: lang.code,
        label: lang.name,
    }));


    return (
        <div className="flex flex-col h-full">
            {/* Language Selection Bar */}
            <div
                className={`border-b border-border bg-surface/50 transition-all duration-300 ease-in-out overflow-hidden ${
                    isCapturing ? 'max-h-0 py-0 opacity-0 border-b-0' : 'max-h-40 opacity-100'
                }`}
            >
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 p-4">
                    <Select
                        label="Source Language"
                        value={sourceLang}
                        options={sourceOptions}
                        onChange={(v) => setSourceLang(v as string)}
                        className="flex-1"
                        searchable
                    />
                    <div className="hidden sm:flex items-end pb-2">
                        <svg
                            className="w-5 h-5 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </div>
                    <Select
                        label="Target Language"
                        value={targetLang}
                        options={targetOptions}
                        onChange={(v) => setTargetLang(v as string)}
                        className="flex-1"
                        searchable
                    />
                </div>
            </div>

            {/* Transcription Panels */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full max-w-5xl mx-auto px-0 sm:px-4">
                    <div className="h-full flex flex-col md:flex-row sm:border-x border-border overflow-hidden">
                        {/* Original Transcription */}
                        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-border min-h-[200px] md:min-h-0">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/50">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Transcription
                                </span>
                                {isCapturing && (
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                        <span className="text-xs text-red-500 font-medium">Recording</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 p-4 overflow-auto">
                                {segments.length === 0 && !partialTranscript ? (
                                    <p className="text-muted-foreground italic">
                                        {isCapturing
                                            ? 'Listening...'
                                            : 'Press the button below to start recording'}
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {segments.map((segment, i) => (
                                            <div key={i} className="flex gap-3">
                                                <span className="text-xs text-muted-foreground font-mono shrink-0 pt-1">
                                                    {formatTimestamp(segment.timestamp)}
                                                </span>
                                                <span className="text-foreground">{capitalize(segment.text)}</span>
                                            </div>
                                        ))}
                                        {partialTranscript && (
                                            <div className="flex gap-3">
                                                <span className="text-xs text-muted-foreground font-mono shrink-0 pt-1">
                                                    {formatTimestamp((Date.now() - recordingStartRef.current) / 1000)}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {capitalize(partialTranscript)}
                                                    <span className="animate-pulse">|</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Translation */}
                        <div className="flex-1 flex flex-col min-h-[200px] md:min-h-0">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border-b border-border/50">
                                <span className="text-sm font-medium text-primary">Translation</span>
                                {isTranslating && (
                                    <div className="flex items-center gap-2">
                                        <svg
                                            className="animate-spin h-3.5 w-3.5 text-primary"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        <span className="text-xs text-primary font-medium">
                                            Translating
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 p-4 overflow-auto bg-primary/[0.02]">
                                {segments.length === 0 ? (
                                    <p className="text-muted-foreground italic">
                                        Translation will appear here
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {segments.map((segment, i) => (
                                            <div key={i} className="flex gap-3">
                                                <span className="text-xs text-muted-foreground font-mono shrink-0 pt-1">
                                                    {formatTimestamp(segment.timestamp)}
                                                </span>
                                                <span className="text-foreground">
                                                    {segment.translation || (
                                                        <span className="text-muted-foreground italic">...</span>
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recording Button */}
            <div className="border-t border-border bg-background">
                <div className="max-w-5xl mx-auto p-6 flex justify-center">
                    <Button
                        size="lg"
                        variant={isCapturing ? 'destructive' : 'primary'}
                        onClick={handleToggleRecording}
                        className="min-w-[200px] h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                        leftIcon={
                            isCapturing ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="6" width="12" height="12" rx="1" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                            )
                        }
                    >
                        {isCapturing ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
