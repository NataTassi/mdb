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
		  font-size: 1.5vw;
    }
  } 

  .vjs-icon-placeholder:before,
	.vjs-remaining-time,
	.vjs-playback-rate-value
	{
    text-shadow: none; // remove button glow
    display: flex;
    justify-content: center;
    align-items: center;
	}

  .vjs-menu-item-text,
	.vjs-playback-rate {
		font-size: 1.5vw;
	}

  // Remove caption settings option
  .vjs-texttrack-settings {
    display: none;
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

  // time tooltip on mouse position
  .video-js .vjs-progress-control:hover .vjs-mouse-display {
    z-index: 2;
  }
  // time tooltip on the current playback position
  .video-js .vjs-progress-holder .vjs-play-progress {
    z-index: 1;
  }

  .video-js .vjs-playback-rate-value::before {
    content: "\f62a";
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
    color: white;
  }

  // remove buttons glow
  .video-js .vjs-control:focus:before, .video-js .vjs-control:hover:before, .video-js .vjs-control:focus {
    text-shadow: none;
  }
`;