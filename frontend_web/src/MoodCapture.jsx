import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, CheckCircle, XCircle, Sparkles, Loader2 } from 'lucide-react';
import PageTransition from './PageTransition';
import { useMood } from './MoodContext';

// Emotion to mood score mapping
// face-api.js detects: happy, sad, angry, fearful, disgust, surprised, neutral
const EMOTION_SCORES = {
    happy: 90,
    surprised: 75,
    neutral: 60,
    fearful: 35,
    sad: 25,
    angry: 20,
    disgust: 15,
};

const getMoodFromEmotion = (emotions) => {
    if (!emotions || Object.keys(emotions).length === 0) return null;

    // Find the dominant emotion
    let maxEmotion = 'neutral';
    let maxScore = 0;

    for (const [emotion, score] of Object.entries(emotions)) {
        if (score > maxScore) {
            maxScore = score;
            maxEmotion = emotion;
        }
    }

    return {
        emotion: maxEmotion,
        score: EMOTION_SCORES[maxEmotion] || 50,
        confidence: maxScore
    };
};

const getMoodEmoji = (emotion) => {
    const emojis = {
        happy: '😊',
        surprised: '😲',
        neutral: '😐',
        fearful: '😨',
        sad: '😢',
        angry: '😠',
        disgust: '🤢',
    };
    return emojis[emotion] || '😐';
};

const getMoodLabel = (score) => {
    if (score >= 80) return 'Thriving';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Okay';
    if (score >= 35) return 'Low';
    if (score >= 20) return 'Struggling';
    return 'Difficult';
};

export const MoodCapture = () => {
    const { submitSurvey } = useMood();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetecting, setIsDetecting] = useState(false);
    const [stream, setStream] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceapi, setFaceapi] = useState(null);

    // Load face-api.js dynamically
    useEffect(() => {
        const loadFaceAPI = async () => {
            try {
                // Dynamically import face-api.js from CDN
                const faceApi = await import('face-api.js');
                setFaceapi(faceApi);

                // Load models from CDN - using tiny face detector for speed
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

                await Promise.all([
                    faceApi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceApi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceApi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                ]);

                setModelsLoaded(true);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to load face-api models:', err);
                setError('Failed to load face detection models. Please refresh and try again.');
                setIsLoading(false);
            }
        };

        loadFaceAPI();
    }, []);

    // Start camera - with device selection to avoid phone camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                // First, request camera permission to get device labels
                // This is necessary because enumerateDevices() returns empty labels without permission
                const testStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

                // Stop the test stream immediately - we just needed the permission
                testStream.getTracks().forEach(track => track.stop());

                // Now enumerate devices with labels available
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');

                console.log('Available cameras:', videoDevices.map(d => ({ label: d.label, id: d.deviceId })));

                // Filter function to identify laptop's built-in webcam
                const isLaptopWebcam = (device) => {
                    const label = (device.label || '').toLowerCase();
                    const deviceId = device.deviceId.toLowerCase();

                    // EXCLUDE phone cameras - check for common phone indicators
                    const phoneIndicators = [
                        'realme', 'iphone', 'android', 'galaxy', 'pixel',
                        'oneplus', 'xiaomi', 'oppo', 'vivo', 'huawei',
                        'motorola', 'nokia', 'asus', 'sony', 'lg '
                    ];

                    for (const phone of phoneIndicators) {
                        if (label.includes(phone)) return false;
                    }

                    // Also exclude USB cameras (often external/webcams that could be phones
                    // when connected via USB debugging)
                    if (deviceId.includes('usb')) return false;

                    // INCLUDE laptop webcam indicators
                    const laptopIndicators = ['integrated', 'built-in', 'webcam', 'hd camera', 'uvc'];
                    return laptopIndicators.some(indicator => label.includes(indicator));
                };

                // Find laptop webcam
                let selectedDeviceId = videoDevices.find(device => isLaptopWebcam(device))?.deviceId;

                // If no specific laptop webcam found, try any non-USB camera
                if (!selectedDeviceId) {
                    selectedDeviceId = videoDevices.find(device =>
                        !device.deviceId.toLowerCase().includes('usb')
                    )?.deviceId;
                }

                // Final fallback - first available camera
                if (!selectedDeviceId && videoDevices.length > 0) {
                    selectedDeviceId = videoDevices[0].deviceId;
                    console.warn('Using fallback camera, could not identify laptop webcam');
                }

                console.log('Selected camera device:', selectedDeviceId);

                // Now start the actual camera with the selected device
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: selectedDeviceId
                        ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
                        : { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: false
                });

                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error('Camera error:', err);
                setError('Camera access denied. Please enable camera permissions.');
                setIsLoading(false);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureAndDetect = async () => {
        if (!videoRef.current || !canvasRef.current || !faceapi || !modelsLoaded) return;

        setIsDetecting(true);
        setError(null);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Ensure video is ready
            if (video.readyState !== 4) {
                await new Promise(resolve => {
                    video.onloadedmetadata = resolve;
                });
            }

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            // Detect faces and expressions
            const detections = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

            if (detections) {
                const moodData = getMoodFromEmotion(detections.expressions);

                if (moodData) {
                    setResult({
                        ...moodData,
                        timestamp: new Date().toISOString(),
                    });
                } else {
                    setError('Could not detect a clear face. Please try again.');
                }
            } else {
                setError('No face detected. Please look at the camera.');
            }
        } catch (err) {
            console.error('Detection error:', err);
            setError('Detection failed. Please try again.');
        } finally {
            setIsDetecting(false);
        }
    };

    const saveMood = () => {
        if (!result) return;

        // Convert score to survey-like answers (20 questions, 1-5 scale)
        // Map 0-100 score to 1-5 range
        const normalizedScore = Math.max(1, Math.min(5, Math.round(result.score / 20)));
        const answers = Array(20).fill(normalizedScore);

        submitSurvey(answers, `Mood detected via face: ${result.emotion}`);

        // Show success briefly then reset
        setTimeout(() => {
            setResult(null);
        }, 2000);
    };

    const resetCapture = () => {
        setResult(null);
        setError(null);
    };

    if (isLoading) {
        return (
            <PageTransition>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/20">
                            <Loader2 className="animate-spin text-purple-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Initializing Camera</h2>
                        <p className="text-gray-400 text-sm">Loading face detection models...</p>
                    </motion.div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto pt-8 pb-16 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    >
                        <Sparkles className="text-white" size={28} strokeWidth={1.5} />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Mood Capture</h1>
                    <p className="text-gray-400 mt-2 text-sm uppercase tracking-wider">Quick mood detection via camera</p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3"
                        >
                            <XCircle className="text-red-400 flex-shrink-0" size={20} />
                            <p className="text-red-300 text-sm">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Result Display */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="mb-8 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/20 rounded-[2rem] p-8 text-center backdrop-blur-xl"
                        >
                            <div className="text-8xl mb-4">{getMoodEmoji(result.emotion)}</div>
                            <h2 className="text-3xl font-bold text-white mb-2">{getMoodLabel(result.score)}</h2>
                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-6">
                                Detected: {result.emotion} ({Math.round(result.confidence * 100)}% confidence)
                            </p>
                            <p className="text-cyan-400 font-bold text-2xl mb-6">Mood Score: {result.score}/100</p>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={resetCapture}
                                    className="px-6 py-3 border border-white/20 rounded-xl text-gray-300 hover:bg-white/5 transition-all font-medium"
                                >
                                    Retake
                                </button>
                                <button
                                    onClick={saveMood}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center gap-2"
                                >
                                    <CheckCircle size={20} />
                                    Save Mood
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Camera Preview */}
                {!result && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="relative aspect-video bg-gray-900">
                            {stream ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Face guide overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-48 h-48 rounded-full border-2 border-white/20 opacity-50"></div>
                                    </div>
                                    {/* Scanning indicator */}
                                    {isDetecting && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="text-center">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                    className="w-12 h-12 mx-auto mb-4 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
                                                />
                                                <p className="text-white font-medium">Analyzing expressions...</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <Camera className="mx-auto mb-4 text-gray-500" size={48} />
                                        <p className="text-gray-400">Starting camera...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="p-6 flex flex-col items-center gap-4">
                            <p className="text-gray-400 text-sm text-center">
                                {modelsLoaded
                                    ? 'Look at the camera and smile!'
                                    : 'Loading detection models...'}
                            </p>

                            <button
                                onClick={captureAndDetect}
                                disabled={!stream || !modelsLoaded || isDetecting}
                                className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white transition-all shadow-[0_0_30px_rgba(139,92,246,0.5)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDetecting ? (
                                    <Loader2 className="animate-spin" size={32} />
                                ) : (
                                    <Camera size={32} />
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Alternative: Manual Entry */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm mb-4">Prefer not to use camera?</p>
                    <a
                        href="/survey"
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
                    >
                        <RefreshCw size={16} />
                        Take the survey instead
                    </a>
                </div>
            </div>
        </PageTransition>
    );
};

export default MoodCapture;
