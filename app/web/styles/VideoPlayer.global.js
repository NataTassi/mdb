import css from 'styled-jsx/css';

export default css.global`
  .video-player-container {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%; 
    height: 100%;
  }


  @media only screen and (max-width: 991px) {
    .video-js .vjs-top-bar {
      height: 20%;
    }
    .video-js .vjs-control-bar { 
      height: 20%;
    }
  } 
  
  @media only screen and (min-width: 992px) {
    .video-js .vjs-top-bar {
      height: 15%;
    }
    .video-js .vjs-control-bar { 
      height: 15%;
    }
  } 
  

  .video-js .vjs-top-bar {
    background: rgba(43,51,63,.7);
    color: white;
    font-size: 3em;
    padding: 0em;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0;
    display: flex;
    align-items: center;
  }
  
  // show top bar after playback has begun and only when paused or the user is active
  .video-js.vjs-paused.vjs-has-started .vjs-top-bar,
  .video-js.vjs-user-active.vjs-has-started .vjs-top-bar {
    opacity: 1;
    visibility: visible;
  }

  .vjs-has-started.vjs-user-inactive.vjs-playing .vjs-top-bar {
    opacity: 0;
    visibility: hidden;
    transition: visibility 1s, opacity 1s;
  }

  .vjs-back-button {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    color: white;
    cursor: pointer;
    // border: solid;
  }


  .video-js .vjs-picture-in-picture-control { display: none; }

  .video-js .vjs-play-control {
    width: 8%;
  }

  .video-js .vjs-play-control .vjs-icon-placeholder:before {
    font-size: 5em;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .video-js .vjs-seek-button {
  }

  .video-js .vjs-volume-panel.vjs-volume-panel-vertical {
    width: 8%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .video-js .vjs-mute-control {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
  }
  .video-js .vjs-mute-control .vjs-icon-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .video-js .vjs-mute-control .vjs-icon-placeholder:before {
    font-size: 4em;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .video-js .vjs-progress-control {
    flex: auto;
    font-size: 2em;
  } 
  // time tooltip on mouse position
  .video-js .vjs-progress-control:hover .vjs-mouse-display {
    z-index: 2;
  }
  // time tooltip on the current playback position
  .video-js .vjs-progress-holder .vjs-play-progress {
    z-index: 1;
  }

  .video-js .vjs-remaining-time {
    width: 8%;
    font-size: 2em;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .video-js .vjs-playback-rate {
    width: 6%;
    display: flex;
    justify-content: center;
    align-items: center;
    // border: solid;
  }

  .video-js .vjs-playback-rate-value {
    -webkit-font-smoothing: antialiased;
    font-style: normal;
    font-feature-settings: normal;
    font-variant: normal;
    line-height: 1;
    text-rendering: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .video-js .vjs-playback-rate-value::before {
    content: "\f62a";
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
    font-size: 2em;
    color: white;
  }

  .video-js .vjs-fullscreen-control {
    width: 6%;
  }
  .video-js .vjs-fullscreen-control .vjs-icon-placeholder:before {
    font-size: 5em;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  // remove buttons glow
  .video-js .vjs-control:focus:before, .video-js .vjs-control:hover:before, .video-js .vjs-control:focus {
    text-shadow: none;
  }
`;