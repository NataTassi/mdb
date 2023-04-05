// --- Global styles ---

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

// Font Awesome
import 'styles/fontawesome/css/all.min.css';

// Video.js
import 'video.js/dist/video-js.min.css';
import 'videojs-seek-buttons/dist/videojs-seek-buttons.css';

// ---------------------------------------------------------


/*
	Fix 'When server rendering, you must wrap your application in an <SSRProvider>'

	React-Bootstrap automatically generates an id for some components if they are not provided. 
	This is done for accessibility purposes. In server-side rendered applications, a SSRProvider 
	must wrap the application in order to ensure that the auto-generated ids are consistent 
	between the server and client.
*/
import SSRProvider from 'react-bootstrap/SSRProvider';


export default function MyApp({ Component, pageProps }) {
  return (
    <SSRProvider>
      <Component {...pageProps} />
    </SSRProvider>
  )
}