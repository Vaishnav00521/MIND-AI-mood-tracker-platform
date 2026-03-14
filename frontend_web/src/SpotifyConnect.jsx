import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Check, RefreshCw, Music, AlertCircle, Headphones } from 'lucide-react';
import SpotifyPlayer from './SpotifyPlayer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const SpotifyConnect = ({
    playlistId,
    playlistUri,
    mood = 'happy',
    onMoodChange,
    showEmbedFallback = true
}) => {
    const [accessToken, setAccessToken] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [useWebPlayer, setUseWebPlayer] = useState(true);
    const [playlists, setPlaylists] = useState(null);

    // Check for Spotify token in URL (from OAuth callback)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (token) {
            // Save token to backend
            saveToken(token, refreshToken);
            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Fetch stored token from backend
    useEffect(() => {
        const fetchStoredToken = async () => {
            try {
                const response = await fetch(`${API_URL}/spotify/get-token/`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.access_token) {
                        setAccessToken(data.access_token);
                        setIsConnected(true);
                    }
                }
            } catch (err) {
                console.log('No stored Spotify token found');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStoredToken();
    }, []);

    // Fetch playlists
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await fetch(`${API_URL}/spotify/playlists/`);
                if (response.ok) {
                    const data = await response.json();
                    setPlaylists(data);
                }
            } catch (err) {
                console.error('Failed to fetch playlists:', err);
            }
        };
        fetchPlaylists();
    }, []);

    // Save token to backend
    const saveToken = async (token, refreshToken) => {
        try {
            const response = await fetch(`${API_URL}/spotify/save-token/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: token,
                    refresh_token: refreshToken
                })
            });

            if (response.ok) {
                setAccessToken(token);
                setIsConnected(true);
            }
        } catch (err) {
            console.error('Failed to save token:', err);
        }
    };

    // Connect to Spotify (OAuth flow)
    const connectSpotify = () => {
        setIsConnecting(true);
        window.location.href = `${API_URL}/spotify/login/`;
    };

    // Disconnect Spotify
    const disconnectSpotify = () => {
        setAccessToken(null);
        setIsConnected(false);
        setUseWebPlayer(false);
    };

    // Handle player error
    const handlePlayerError = useCallback((err) => {
        console.error('Player error:', err);
        if (err.message?.includes('Premium') || err.message?.includes('premium')) {
            // Premium required - fall back to embed
            setUseWebPlayer(false);
            setError('Spotify Premium required for playback. Showing embed player instead.');
        }
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                backgroundColor: 'rgba(30, 215, 96, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(30, 215, 96, 0.2)'
            }}>
                <RefreshCw className="animate-spin" size={24} style={{ color: '#1DB954' }} />
                <span style={{ marginLeft: '12px', color: '#1DB954' }}>Connecting to Spotify...</span>
            </div>
        );
    }

    // Not connected - show connect button
    if (!isConnected) {
        return (
            <div style={{
                backgroundColor: '#181818',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                maxWidth: '500px',
                margin: '0 auto'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 16px',
                    backgroundColor: '#1DB954',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Headphones size={32} color="#000" />
                </div>

                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    Connect Your Spotify
                </h3>

                <p style={{ color: '#b3b3b3', fontSize: '14px', marginBottom: '24px' }}>
                    Connect your Spotify account to play mood-based playlists directly in the app.
                </p>

                <button
                    onClick={connectSpotify}
                    disabled={isConnecting}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#1DB954',
                        color: '#000',
                        border: 'none',
                        borderRadius: '24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isConnecting ? 'not-allowed' : 'pointer',
                        opacity: isConnecting ? 0.7 : 1,
                        transition: 'transform 0.1s, background-color 0.2s'
                    }}
                >
                    {isConnecting ? (
                        <>
                            <RefreshCw className="animate-spin" size={18} />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <Music size={18} />
                            Connect Spotify
                        </>
                    )}
                </button>

                <p style={{ color: '#666', fontSize: '12px', marginTop: '16px' }}>
                    Requires Spotify Premium for playback
                </p>

                {/* Also show embed as alternative */}
                {showEmbedFallback && playlistId && (
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #333' }}>
                        <p style={{ color: '#888', fontSize: '12px', marginBottom: '16px' }}>
                            Or listen with the embedded player (no account needed):
                        </p>
                        <iframe
                            style={{ borderRadius: '12px' }}
                            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
                            width="100%"
                            height="152"
                            frameBorder="0"
                            allowFullScreen=""
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            title="Spotify Playlist"
                        />
                    </div>
                )}
            </div>
        );
    }

    // Connected - show player
    return (
        <div>
            {/* Connection Status Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'rgba(30, 215, 96, 0.1)',
                borderRadius: '8px 8px 0 0',
                borderBottom: '1px solid #282828'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={16} color="#1DB954" />
                    <span style={{ color: '#1DB954', fontSize: '13px', fontWeight: '500' }}>
                        Connected to Spotify
                    </span>
                </div>
                <button
                    onClick={disconnectSpotify}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    Disconnect
                </button>
            </div>

            {/* Error Notice */}
            {error && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 153, 0, 0.1)',
                    borderBottom: '1px solid #282828'
                }}>
                    <AlertCircle size={16} color="#ff9900" />
                    <span style={{ color: '#ff9900', fontSize: '13px' }}>{error}</span>
                </div>
            )}

            {/* Player */}
            {useWebPlayer && accessToken ? (
                <SpotifyPlayer
                    accessToken={accessToken}
                    playlistId={playlistId}
                    playlistUri={playlistUri}
                    onError={handlePlayerError}
                    autoPlay={false}
                />
            ) : (
                /* Fallback to iframe embed */
                <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <iframe
                        style={{ borderRadius: '12px' }}
                        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="352"
                        frameBorder="0"
                        allowFullScreen=""
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title="Spotify Playlist"
                    />
                </div>
            )}
        </div>
    );
};

export default SpotifyConnect;
