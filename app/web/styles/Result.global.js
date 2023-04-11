import css from 'styled-jsx/css';

export default css.global`
  	.poster {
  	  background: black;
  	  position: relative;
  	  width: 100%;
  	  height: 0;
  	  padding-top: 120%; /* 5:6 aspect ratio */
  	}

	// Show popper content only when show-content attribute is set
	#tooltip {
		display: none;
	}
	#tooltip[show-content] {
		display: block;
	}

	// Don't show play button on autoplay
	.vjs-waiting {
		visibility: hidden;
	}

  	@media only screen and (max-width: 991px) {
    	.video-js .vjs-control-bar { 
          height: 20%;
          font-size: 2vw;
  		}
  	} 
  
  	@media only screen and (min-width: 992px) {
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

	.vjs-playback-rate {
		font-size: 1vw;
	}

	// .video-js .vjs-big-play-button {
	// 	font-size: 300%;
	// }

  	// time tooltip on mouse position
  	.video-js .vjs-progress-control:hover .vjs-mouse-display {
  		z-index: 2;
  	}
  	// time tooltip on the current playback position
  	.video-js .vjs-progress-holder .vjs-play-progress {
  		z-index: 1;
  	}

	.info-button {
		color: grey;
	}
	.info-button:hover {
		color: #BBBBBB;
		filter: drop-shadow(0px 1px 1px #BBBBBB);
	}
	.info-button-play {
		color: white;
	}
	.info-button-play:hover {
		filter: drop-shadow(0px 1px 4px white);
	}

	.details-modal {
		min-width: 50%;
	}
	.modal-content {
		-webkit-border-radius: 15px !important;
		-moz-border-radius: 15px !important;
		border-radius: 15px !important;
		background-color: #111111;
		overflow: hidden;
		filter: drop-shadow(0px 0px 1px grey);
	}
`;