import VideoPlayer from 'components/VideoPlayer';
import { validImdbID } from 'model/movies';
import { useRouter } from 'next/router';
import { jsonFetcher } from 'utils/api';
import Error from 'next/error';
import React from 'react';
import useSWR from 'swr';


export default function WatchVideo() {
  const { imdb_id } = useRouter().query;
  const { data, error } = useSWR(`/api/movie/${imdb_id}`, jsonFetcher);

  if (error) {
    return <Error statusCode={500} />
  }

  if (!data) {
    return <div />;
  }

  if (!validImdbID(imdb_id)) {
    return <Error statusCode={404} />
  }

  const moviePath = data.movie_path;
  const videoExtension = moviePath.substring(moviePath.length-3);
  let mimeType;

  if (videoExtension === 'mp4') {
    mimeType = 'mp4';
  }
  else if (videoExtension === 'mkv') {
    mimeType = 'webm';
  }

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fill: true,
    noUITitleAttributes: true,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5],
    sources: [{
      src: moviePath,
      type: `video/${mimeType}`
    }],
    controlBar: {
      volumePanel: {
        inline: false
      }
    },
  };

  const handlePlayerReady = (player) => {
    // You can handle player events here:

    player.on('waiting', () => {
      player.log('player is waiting');
    });

    player.on('dispose', () => {
      player.log('player will be disposed');
    });
  };

  return (
    <VideoPlayer 
      title={data.title} 
      options={videoJsOptions} 
      onReady={handlePlayerReady} 
      subtitles={data.subtitles_paths}
    />
  );
}