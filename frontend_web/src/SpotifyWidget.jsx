import React from 'react';

const SpotifyWidget = ({ playlistId, height = '352' }) => {
    if (!playlistId) {
        return (
            <div className="spotify-widget-error" style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                borderRadius: '8px',
                color: '#ff6b6b',
                textAlign: 'center'
            }}>
                No playlist selected. Please select a playlist to play music.
            </div>
        );
    }

    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

    return (
        <div className="spotify-widget-container" style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backgroundColor: '#121212'
        }}>
            <iframe
                style={{ borderRadius: '12px' }}
                src={embedUrl}
                width="100%"
                height={height}
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Music Player"
            />
        </div>
    );
};

export default SpotifyWidget;
