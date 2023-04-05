import React, { useEffect, useRef, useState } from 'react';
import BasicVideoPlayer from 'components/BasicVideoPlayer';
import globalStyles from 'styles/Results.global.js';
import { createPopper } from '@popperjs/core';
import useDebounce from 'utils/useDebounce';
import { urlExistsBrowser } from 'utils/file';
import { ENGLISH } from 'model/strings';
import Image from 'next/image';

import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const POPPER_DELAY = 500;
const trailerPlaybackPosition = new Map();


function TrailerPlayer(props) {
  const playerRef = useRef(null);
  const trailer_id = props.metadata.yt_video_ids[0];

  const format = urlExistsBrowser(`/Movies/Trailers/${trailer_id}.webm`) ? 'webm' : 'mp4';

  return (
    <div
      onMouseLeave={(e) => {
        const currentTime = Math.max(playerRef.current.currentTime() - 3, 0);
        trailerPlaybackPosition.set(trailer_id, currentTime);
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
          width: props.width,
          height: props.height,
          responsive: true,
          controls: true,
          controlBar: {
            pictureInPictureToggle: false
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


function Result(props) {
  const resultElem = useRef(null);
  const contentElem = useRef(null);
  const popperElem = useRef(null);
  const descriptionRef = useRef(null);

  const [popperInstance, setPopperInstance] = useState(null);
  const [showPopper, setShowPopper] = useState(false);
  const debouncedShowPopper = useDebounce(showPopper, POPPER_DELAY);
  const [eagerLoad, setEagerLoad] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0});
  const [popperContent, setPopperContent] = useState(<div/>);
  const [detailsContent, setDetailsContent] = useState(<div/>);
  const [showDetails, setShowDetails] = useState(false);

  const background = '#111111';
  const inEnglish = props.language === ENGLISH;
  const metadata = props.metadata;
  const url = `/watch/${metadata.imdb_id}`;

  const plot = inEnglish ? metadata.plot : metadata.plot_spanish;
  const genres = inEnglish ? metadata.genres : metadata.genres_spanish;
  const title = inEnglish ? metadata.title : metadata.title_spanish;
  const titleAndYear = `${title} (${metadata.release_year})`;
  const formattedRuntime = `${Math.floor(metadata.runtime / 60)}h ${metadata.runtime % 60}m`;
  const formattedGenres = genres.join(' • ');


  useEffect(() => {
    const width = contentElem.current.offsetWidth;
    const height = contentElem.current.offsetHeight;

    setPopperInstance(createPopper(
      contentElem.current, 
      popperElem.current, 
      { 
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, - 1.3 * height]
            },
          }
        ],
       }
    ));

    setDimensions({ width: width, height: height});

    const showEvents = ['mouseenter', 'focus'];
    const hideEvents = ['mouseleave', 'blur'];

    showEvents.forEach((event) => {
      resultElem.current.addEventListener(event, () => setShowPopper(true));
    });
    hideEvents.forEach((event) => {
      resultElem.current.addEventListener(event, () => setShowPopper(false));
    });
  }, []);

  useEffect(() => {
    if (showDetails) {
      const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

      const spanStyles = {color: '#AAAAAA'};

      setDetailsContent((
        <>
          <TrailerPlayer 
            width={viewportWidth / 2}
            height={viewportWidth / 2 * 3/5}
            metadata={metadata} 
          />

          <Container fluid className='p-4'>
            <Row>
              <Col className='fs-5'>
                <div>{titleAndYear}</div>
              </Col>
            </Row> 
            <Row className='mt-3'>
              <Col>{plot}</Col>
            </Row>
            <Row className='mt-5'>
              <Col><span style={spanStyles}>{inEnglish ? 'Runtime' : 'Duración'}:</span> {formattedRuntime}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{inEnglish ? 'Release date' : 'Fecha de lanzamiento'}:</span> {metadata.release_date}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{inEnglish ? 'Genres' : 'Géneros'}:</span> {genres.join(', ')}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{inEnglish ? 'Cast' : 'Reparto'}:</span> {metadata.cast.join(', ')}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{inEnglish ? 'Writers' : 'Escritores'}:</span> {metadata.writers.join(', ')}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{inEnglish ? 'Directors' : 'Directores'}:</span> {metadata.directors.join(', ')}</Col>
            </Row>
          </Container>
        </>
      ));
    }
    else {
      setDetailsContent(<div/>);
    }
  }, [showDetails]);

  useEffect(() => {
    if (debouncedShowPopper) {
      const trailerHeight = 1.2 * dimensions.width;

      setPopperContent((
        <>
          <TrailerPlayer 
            descriptionRef={descriptionRef}
            width={2*dimensions.width} 
            height={trailerHeight} 
            metadata={metadata} 
          />

          <Container 
            fluid
            ref={descriptionRef}
            style={{ 
              cursor: 'pointer',
              visibility: 'hidden',
              position: 'absolute',
              top: `${trailerHeight}px`,
              bottom: 0,
            }}
            onClick={(e) => { 
              if (!e.target.classList.contains('info-button')) {
                window.location.href = url;
              }
            }}
          >
            <Row className='mt-3 mx-1'>
              <Col>
                <a href={url}>
                  <i className='fa-solid fa-circle-play info-button-play' />
                </a>
                <i 
                  onClick={() => { alert('Add to watchlist was clicked'); }} 
                  className='mx-2 fa-solid fa-circle-plus info-button'
                />
              </Col>
              <Col className='d-flex justify-content-center align-items-center'>
                <div>{`${formattedRuntime}`}</div>
              </Col>
              <Col className='d-flex justify-content-end'>
                <i 
                  onClick={() => setShowDetails(true)} 
                  className='fa-solid fa-circle-chevron-down info-button' 
                />
              </Col>
            </Row>
            <Row className='mt-3'>
              <Col className='d-flex justify-content-center fs-5 text-center lh-1'>
                <div>{titleAndYear}</div>
              </Col>
            </Row> 

            <Row className='mt-2'>
               <Col className='d-flex justify-content-center fs-6'>
                 <div>{formattedGenres}</div>
               </Col>
            </Row> 
          </Container>
        </>
      ));
      popperElem.current.setAttribute('show-content', ''); // show popper
      popperInstance.update(); // update popper position

    }
    else { 
      popperElem.current.removeAttribute('show-content'); // hide popper
      setPopperContent(<div/>);
    }
 
    if (popperInstance) {
      // Toggle popper event listeners for performance reasons
      popperInstance.setOptions((options) => ({
        ...options,
        modifiers: [
          ...options.modifiers,
          { name: 'eventListeners', enabled: debouncedShowPopper },
        ],
      }));
    }
  }, [debouncedShowPopper]);

  return (
    <div ref={resultElem}>
      <a href={url}>
        <Card ref={contentElem}>
          <Image 
            src={metadata.poster_path} 
            fill
            sizes="15vw"
            onMouseEnter={() => setEagerLoad(true)}
            loading={eagerLoad ? 'eager' : 'lazy'}
            alt="Poster"
          />
        </Card>
      </a>

      <div 
        id="tooltip" 
        ref={popperElem} 
        className='text-white border border-dark'
        style={{ 
          width: 2 * dimensions.width,
          height: 1.6 * dimensions.height,
          backgroundColor: background,
          zIndex: 1,
          borderRadius: '15px',
          overflow: 'hidden' // hide sharp corners from the video
        }}
      >
        {popperContent}
      </div>

      <Modal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        dialogClassName='details-modal'
      >
        <Modal.Body
          style={{
            backgroundColor: background,
            color: 'white',
            padding: 0,
            margin: 0
          }}
        >
          {detailsContent}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default function Results(props) {
  if (props.loading) {
    return <div />;
  }

  if (props.error) {
    return (
      <div className='d-flex justify-content-center'>
        <div className='fs-4 text-light vertical-center'>
          Something went wrong ☹
        </div>
      </div>
    )
  }

  const colsPerRow = props.colsPerRow;
  const results = props.results;
  const size = results.length;
  const rows = [];
  let number = 0;
  let cols;

  results.forEach((metadata, idx) => {
    const pos = idx % colsPerRow;

    if (pos == 0) cols = [];

    cols.push((
      <Col>
        <Result
          language={props.language}
          metadata={metadata}
          number={number}
        />
      </Col>
    ));

    number++;

    if (pos == colsPerRow-1 || idx == size-1) {
      if (idx == size-1) {
        for (let i = pos + 1; i < colsPerRow; i++) {
          cols.push(<Col />)
        }
      }

      rows.push(<Row className='my-5'>{cols}</Row>);
    }
  });

  return (
    <>
      <style jsx global>{globalStyles}</style>

      <Container fluid style={props.style} >{rows}</Container>
    </>
  );
}