import React from 'react';
import videojs from 'video.js';


export default function BasicVideoPlayer(props) {
  const placeholderRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady } = props;

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const placeholderEl = placeholderRef.current;
      const videojsElem = document.createElement('video-js');
      videojsElem.className = 'video-js vjs-big-play-centered playsinline vjs-waiting';
      const videoElement = placeholderEl.appendChild(videojsElem);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        player.log("Player is ready");
        onReady && onReady(player);
      }));

    } else { // You can update the player here:
      const player = playerRef.current;
      player.src(options.sources);
    }
  }, [options, onReady]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  /*
    Wrap the player in a 'div' with a 'data-vjs-player' attribute, so Video.js
    won't create an additional wrapper in the DOM. See: https://github.com/videojs/video.js/pull/3856
  */
  return (
    <div 
      data-vjs-player 
      ref={placeholderRef}
      style={{ backgroundColor: 'black' }}
    />
  )
}