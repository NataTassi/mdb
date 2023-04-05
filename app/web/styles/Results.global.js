import css from 'styled-jsx/css';

export default css.global`
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

	.info-button {
		font-size: 35px;
		color: grey;
	}
	.info-button:hover {
		color: #BBBBBB;
		filter: drop-shadow(0px 1px 1px #BBBBBB);
	}
	.info-button-play {
		font-size: 35px;
		color: white;
	}
	.info-button-play:hover {
		color: white;
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