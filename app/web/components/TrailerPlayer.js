import React, { useRef } from 'react';
import { urlExists } from 'utils/url';
import BasicVideoPlayer from 'components/BasicVideoPlayer';

const trailerPlaybackPosition = new Map();


export default function TrailerPlayer(props) {
  const playerRef = useRef(null);
  const trailer_id = props.metadata.yt_video_ids[0];

  const format = urlExists(`/Movies/Trailers/${trailer_id}.webm`) ? 'webm' : 'mp4';

  return (
    <div
      onMouseLeave={(e) => {
        if (playerRef.current) {
          const currentTime = Math.max(playerRef.current.currentTime() - 3, 0);
          trailerPlaybackPosition.set(trailer_id, currentTime);
        }
      }}
    >
      <BasicVideoPlayer 
        onReady={ player => {
          if (player == null) return;

          playerRef.current = player;

          if (props.descriptionRef && props.descriptionRef.current) {
            props.descriptionRef.current.style.visibility = 'visible';
          }

          if (trailerPlaybackPosition.has(trailer_id)) {
            player.currentTime(trailerPlaybackPosition.get(trailer_id));
          }

          player.controlBar.hide();
          player.on('fullscreenchange', function(e) {
            if (player.isFullscreen()) {
              player.controlBar.show();
            } else {
              player.controlBar.hide();
            }
          });

          player.ready(() => {
            if (!player.el_) return; // player was disposed
            player.muted(false);
            const autoplayAttempt = player.play();

            if (autoplayAttempt !== undefined) {
              autoplayAttempt.then(() => {
                console.debug('autoplay allowed');
              })
              .catch((error) => {
                if (!player.el_) return;
                player.muted(true);
                const autoplayMutedAttempt = player.play();

                if (autoplayMutedAttempt !== undefined) {
                  autoplayMutedAttempt.then(() => {
                    console.debug('autoplay allowed muted');
                  })
                  .catch((error) => {
                    if (!player.el_) return;
                    player.muted(false);
                    console.debug('autoplay not allowed');
                  });
                }
              });
            }
          });
        }}

        options={{
          loop: true,
          controls: true,
          responsive: true,
          width: props.width,
          height: props.height,
          controlBar: {
            pictureInPictureToggle: false,
            volumePanel: {
              inline: false
            }
          },
          sources: [{
            src: `/Movies/Trailers/${trailer_id}.${format}`,
            type: `video/${format}`
          }],
        }}
      />
    </div>
  );
}