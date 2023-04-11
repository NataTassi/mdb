import 'videojs-seek-buttons/dist/videojs-seek-buttons.min.js';
import globalStyles from 'styles/VideoPlayer.global.js';
import { TopBar } from 'components/VideoPlayerTopBar';
import { useRouter } from 'next/router';
import videojs from 'video.js';
import React from 'react';


export default function VideoPlayer(props) {
  const placeholderRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady } = props;
  const router = useRouter();

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const placeholderEl = placeholderRef.current;
      const videojsElem = document.createElement('video-js');
      videojsElem.className = 'video-js vjs-big-play-centered';

      for (const path of props.subtitles) {
        const trackElem = document.createElement('track');
        const lang = path.endsWith('EN.vtt') ? 'en' : 'es';
        console.debug(path);
        trackElem.setAttribute('kind', 'captions');
        trackElem.setAttribute('src', path);
        trackElem.setAttribute('srclang', lang);
        trackElem.setAttribute('label', lang === 'en' ? 'English' : 'Español');
        videojsElem.appendChild(trackElem);
      }

      const videoElement = placeholderEl.appendChild(videojsElem);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        player.log("Player is ready");
        onReady && onReady(player);
      }));

      player.seekButtons({
        forward: 10,
        back: 10
      });

      // Add the TopBar as a child of the player and provide it some text in its options.
      player.addChild('TopBar', {
        text: props.title,
        onClickBack: router.back
      });

      // remove text from playback rate
      const playbackRate = player.getChild('ControlBar').getChild('PlaybackRateMenuButton');
      const playbackRateValue = document.getElementsByClassName('vjs-playback-rate-value')[0];
      playbackRate.updateLabel = (e) => {};
      playbackRateValue.innerHTML = "";
      
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
    <>
      <style jsx global>{globalStyles}</style>

      <div data-vjs-player ref={placeholderRef} className='video-player-container' />
    </>
  )
}