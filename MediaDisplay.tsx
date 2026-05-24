import React, { useEffect, useRef, memo } from 'react';

export const MediaDisplay = memo(({ url, className, style, currentTime }: { url: string; className?: string; style?: React.CSSProperties; currentTime?: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && currentTime !== undefined && !isNaN(currentTime)) {
      // Only seek if the drift is significant (e.g. > 1s) to prevent flickering from frequent updates
      const drift = Math.abs(videoRef.current.currentTime - currentTime);
      if (drift > 1) {
        videoRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime]);

  if (!url) return null;

  if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
    const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('youtu.be/')[1]?.split('?')[0];
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className={className}
        style={style}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (url.includes('tiktok.com/')) {
    // TikTok blockquote or simple embedded iframe
    const videoId = url.split('/video/')[1]?.split('?')[0];
    if (videoId) {
      return (
        <iframe
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            className={className}
            style={style}
            allowFullScreen
        />
      );
    }
  }

  if (url.includes('.mp4') || url.includes('.webm') || url.startsWith('data:video') || url.includes('#ext=.mp4')) {
    return (
      <video
        ref={videoRef}
        src={url}
        className={className}
        style={style}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }

  return <img src={url} alt="Media" className={className} style={style} />;
});
