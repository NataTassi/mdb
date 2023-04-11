import React, { useEffect, useRef, useState } from 'react';
import TrailerPlayer from 'components/TrailerPlayer';
import globalStyles from 'styles/Result.global.js';
import { createPopper } from '@popperjs/core';
import useDebounce from 'utils/useDebounce';
import { ENGLISH } from 'model/strings';
import Image from 'next/image';

import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';


const POPPER_DELAY = 500;


export default function Result(props) {
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
  const dateOptions = {year: 'numeric', month: 'long', day: 'numeric'};
  const formattedReleaseDate = new Date(metadata.release_date).toLocaleDateString(inEnglish ? "en-EN" : "es-ES", dateOptions); 


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
              <Col><span style={spanStyles}>{inEnglish ? 'Release date' : 'Fecha de lanzamiento'}:</span> {formattedReleaseDate}</Col>
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
              <Col md={2} className='d-flex justify-content-end align-items-center '>
                <a href={url} style={{ fontSize: '2.2vw' }}>
                  <i className='fa-solid fa-circle-play info-button-play'/>
                </a>
              </Col>
              <Col md={2} className='d-flex justify-content-start align-items-center '>
                <i 
                  onClick={() => { alert('Add to watchlist was clicked'); }} 
                  className='fa-solid fa-circle-plus info-button'
                  style={{ fontSize: '2.2vw' }}
                />
              </Col>
              <Col md={4} className='d-flex justify-content-center align-items-center '>
                <div style={{ fontSize: '1vw' }}>{`${formattedRuntime}`}</div>
              </Col>
              <Col md={4} className='d-flex justify-content-end align-items-center '>
                <i 
                  onClick={() => setShowDetails(true)} 
                  className='fa-solid fa-circle-chevron-down info-button' 
                  style={{ fontSize: '2.2vw' }}
                />
              </Col>
            </Row>

            <Row className='mt-2'>
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
    <>
      <style jsx global>{globalStyles}</style>

        <div ref={resultElem}>
          <a href={url}>
            <div 
              ref={contentElem}
              className='poster' 
            >
              <Image 
                src={metadata.poster_path} 
                fill
                sizes="15vw"
                onMouseEnter={() => setEagerLoad(true)}
                loading={eagerLoad ? 'eager' : 'lazy'}
                alt="Poster"
              />
            </div>
          </a>

          <div 
            id='tooltip'
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
    </>
  );
}