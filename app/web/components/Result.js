import React, { useEffect, useRef, useState } from 'react';
import TrailerPlayer from 'components/TrailerPlayer';
import { createPopper } from '@popperjs/core';
import useDebounce from 'utils/useDebounce';
import { BACKGROUND_COLOR } from 'resources/colors';
import { ENGLISH } from 'resources/strings';
import Image from 'next/image';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const POPPER_DELAY = 400;


export default function Result(props) {
  const resultElem = useRef(null);
  const contentElem = useRef(null);
  const popperElem = useRef(null);
  const descriptionRef = useRef(null);

  const [popperInstance, setPopperInstance] = useState(null);
  const [showPopper, setShowPopper] = useState(false);
  const debouncedShowPopper = useDebounce(showPopper, POPPER_DELAY);
  const [posterDimensions, setPosterposterDimensions] = useState({ width: 0, height: 0});
  const [popperContent, setPopperContent] = useState(<div/>);

  const inEnglish = props.language === ENGLISH;
  const metadata = props.metadata;
  const url = `/watch/${metadata.imdb_id}`;

  const formattedRuntime = `${Math.floor(metadata.runtime / 60)}h ${metadata.runtime % 60}m`;
  const title = inEnglish ? metadata.title : metadata.title_spanish;
  const titleAndYear = `${title} (${metadata.release_year})`;
  const genres = inEnglish ? metadata.genres : metadata.genres_spanish;
  const formattedGenres = genres.join(' • ');


  useEffect(() => {
    const width = contentElem.current.offsetWidth;
    const height = contentElem.current.offsetHeight;
    setPosterposterDimensions({ width: width, height: height});

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
    if (debouncedShowPopper && !props.openDetails) {
      const trailerHeight = 1.2 * posterDimensions.width;

      setPopperContent((
        <>
          <TrailerPlayer 
            descriptionRef={descriptionRef}
            width={2*posterDimensions.width} 
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
            <Row className='mt-2 mx-1'>
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
                  onClick={() => props.onOpenDetails(props.number)} 
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

      setPopperInstance(createPopper(
        contentElem.current, 
        popperElem.current, 
        { 
          placement: 'top',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, - 1.3 * posterDimensions.height]
              },
            }
          ],
         }
      ));

      popperElem.current.setAttribute('show-content', ''); // show popper
    }
    else { 
      popperElem.current.removeAttribute('show-content'); // hide popper
      setPopperContent(<div/>);

      if (popperInstance) {
        popperInstance.destroy();
        setPopperInstance(null);
      }
    }
  }, [debouncedShowPopper, props.openDetails]);

  return (
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
            alt="Poster"
          />
        </div>
      </a>

      <div 
        id='tooltip'
        ref={popperElem} 
        className='text-white border border-dark'
        style={{ 
          width: 2 * posterDimensions.width,
          height: 1.6 * posterDimensions.height,
          backgroundColor: BACKGROUND_COLOR,
          zIndex: 1,
          borderRadius: '15px',
          overflow: 'hidden' // hide sharp corners from the video
        }}
      >
        {popperContent}
      </div>
    </div>
  );
}