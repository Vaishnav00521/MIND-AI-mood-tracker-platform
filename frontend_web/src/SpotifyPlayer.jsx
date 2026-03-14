import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2, AlertCircle } from 'lucide-react';

const SpotifyPlayer = ({
    accessToken,
    playlistUri,
    playlistId,
    onError,
    onReady,
    autoPlay = false
}) => {
    const [player, setPlayer] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const playerRef = useRef(null);
    const spotifyApiRef = useRef(null);

    // Initialize Spotify Web Playback SDK
    useEffect(() => {
        if (!accessToken) {
            setError('No access token provided. Please connect your Spotify account.');
            setIsLoading(false);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: 'MindAI Mood Tracker',
                getOAuthToken: cb => cb(accessToken),
                volume: volume
            });

            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Spotify Player Ready with Device ID:', device_id);
                setDeviceId(device_id);
                setIsReady(true);
                setIsLoading(false);
                if (onReady) onReady(device_id);

                // Transfer playback to this device if needed
                transferPlayback(device_id, accessToken);
            });

            spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Spotify Player not ready, device:', device_id);
                setIsReady(false);
            });

            spotifyPlayer.addListener('player_state_changed', (state => {
                if (!state) return;

                setIsPlaying(!state.paused);
                setCurrentTrack(state.track_window.current_track);
            }));

            spotifyPlayer.addListener('initialization_error', ({ message }) => {
                console.error('Initialization error:', message);
                setError('Failed to initialize Spotify player: ' + message);
                setIsLoading(false);
            });

            spotifyPlayer.addListener('authentication_error', ({ message }) => {
                console.error('Authentication error:', message);
                setError('Spotify authentication failed. Please reconnect your account.');
                setIsLoading(false);
            });

            spotifyPlayer.addListener('account_error', ({ message }) => {
                console.error('Account error:', message);
                setError('Spotify Premium is required for playback. Please upgrade your account.');
                setIsLoading(false);
            });

            spotifyPlayer.connect();
            playerRef.current = spotifyPlayer;
            setPlayer(spotifyPlayer);
        };

        return () => {
            if (playerRef.current) {
                playerRef.current.disconnect();
            }
        };
    }, [accessToken]);

    // Transfer playback to this device
    const transferPlayback = async (deviceId, token) => {
        try {
            await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    device_ids: [deviceId],
                    play: false
                })
            });
        } catch (err) {
            console.error('Failed to transfer playback:', err);
        }
    };

    // Play a specific playlist/track
    const playPlaylist = useCallback(async (uri, trackUri) => {
        if (!deviceId || !accessToken) return;

        try {
            // First, put the playlist in the player's queue or play directly
            let endpoint = 'https://api.spotify.com/v1/me/player/play';
            let body = {};

            if (trackUri) {
                // Play specific track
                body = {
                    uris: [trackUri],
                    position_ms: 0
                };
            } else if (uri) {
                // Play playlist
                body = {
                    context_uri: uri,
                    position_ms: 0
                };
            }

            const response = await fetch(`${endpoint}?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to play');
            }
        } catch (err) {
            console.error('Play error:', err);
            setError(err.message);
            if (onError) onError(err);
        }
    }, [deviceId, accessToken, onError]);

    // Handle playlist/track changes
    useEffect(() => {
        if (isReady && (playlistUri || playlistId)) {
            const uri = playlistUri || `spotify:playlist:${playlistId}`;
            playPlaylist(uri);
        }
    }, [isReady, playlistUri, playlistId, playPlaylist]);

    // Player controls
    const togglePlay = async () => {
        if (!player) return;
        await player.togglePlay();
    };

    const skipNext = async () => {
        if (!player) return;
        await player.nextTrack();
    };

    const skipPrevious = async () => {
        if (!player) return;
        await player.previousTrack();
    };

    const handleVolumeChange = async (newVolume) => {
        setVolume(newVolume);
        if (player) {
            await player.setVolume(newVolume);
        }
    };

    const toggleMute = () => {
        handleVolumeChange(volume > 0 ? 0 : 0.5);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="spotify-player-loading" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                backgroundColor: 'rgba(30, 215, 96, 0.1)',
                borderRadius: '12px',
                gap: '12px'
            }}>
                <Loader2 className="animate-spin" size={32} style={{ color: '#1DB954' }} />
                <p style={{ color: '#1DB954', fontSize: '14px' }}>Connecting to Spotify...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="spotify-player-error" style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 0, 0, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <AlertCircle size={24} color="#ff6b6b" />
                    <p style={{ color: '#ff6b6b', fontWeight: '600' }}>Playback Error</p>
                </div>
                <p style={{ color: '#ff6b6b', fontSize: '14px' }}>{error}</p>
                <p style={{ color: '#888', fontSize: '12px', marginTop: '12px' }}>
                    Note: Spotify Premium is required for Web Playback SDK to work.
                </p>
            </div>
        );
    }

    return (
        <div className="spotify-player" style={{
            backgroundColor: '#181818',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '400px'
        }}>
            {/* Track Info */}
            {currentTrack ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    {currentTrack.album.images?.[2] ? (
                        <img
                            src={currentTrack.album.images[2].url}
                            alt={currentTrack.album.name}
                            style={{ width: '56px', height: '56px', borderRadius: '4px' }}
                        />
                    ) : (
                        <div style={{ width: '56px', height: '56px', backgroundColor: '#333', borderRadius: '4px' }} />
                    )}
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {currentTrack.name}
                        </p>
                        <p style={{
                            color: '#b3b3b3',
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {currentTrack.artists.map(a => a.name).join(', ')}
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: '16px', padding: '20px', textAlign: 'center', backgroundColor: '#282828', borderRadius: '8px' }}>
                    <p style={{ color: '#b3b3b3', fontSize: '14px' }}>No track playing</p>
                    <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>Select a playlist to start</p>
                </div>
            )}

            {/* Playback Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
                <button
                    onClick={skipPrevious}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#b3b3b3'
                    }}
                >
                    <SkipBack size={24} />
                </button>

                <button
                    onClick={togglePlay}
                    disabled={!isReady}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#1DB954',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s'
                    }}
                >
                    {isPlaying ? (
                        <Pause size={24} color="#000" />
                    ) : (
                        <Play size={24} color="#000" style={{ marginLeft: '2px' }} />
                    )}
                </button>

                <button
                    onClick={skipNext}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#b3b3b3'
                    }}
                >
                    <SkipForward size={24} />
                </button>
            </div>

            {/* Volume Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    onClick={toggleMute}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#b3b3b3'
                    }}
                >
                    {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    style={{
                        flex: 1,
                        height: '4px',
                        WebkitAppearance: 'none',
                        background: `linear-gradient(to right, #1DB954 ${volume * 100}%, #535353 ${volume * 100}%)`,
                        borderRadius: '2px',
                        cursor: 'pointer'
                    }}
                />
            </div>

            {/* Premium Notice */}
            <p style={{
                color: '#666',
                fontSize: '11px',
                textAlign: 'center',
                marginTop: '16px'
            }}>
                Powered by Spotify Web Playback SDK • Requires Spotify Premium
            </p>
        </div>
    );
};

// CSS for range input
const style = document.createElement('style');
style.textContent = `
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
  }
  input[type="range"]::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    border: none;
  }
`;
document.head.appendChild(style);

export default SpotifyPlayer;
