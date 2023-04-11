import React, { useEffect, useState } from 'react';
import globalStyles from 'styles/Results.global.js';
import TrailerPlayer from 'components/TrailerPlayer';
import { strings, ENGLISH } from 'resources/strings';
import { BACKGROUND_COLOR, METADATA_DESC_COLOR } from 'resources/colors';

import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Result from 'components/Result';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const HIDE_DETAILS = -1;

export default function Results(props) {
  const [activeDetails, setActiveDetails] = useState(HIDE_DETAILS);
  const [detailsContent, setDetailsContent] = useState(<div/>);
  
  const openDetails = activeDetails !== HIDE_DETAILS;
  const language = props.language;
  const results = props.results;

  useEffect(() => {
    if (activeDetails !== HIDE_DETAILS) {
      const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

      const spanStyles = {color: METADATA_DESC_COLOR};
      const inEnglish = props.language === ENGLISH;
      const metadata = props.results[activeDetails];
      const url = `/watch/${metadata.imdb_id}`;
      const title = inEnglish ? metadata.title : metadata.title_spanish;
      const titleAndYear = `${title} (${metadata.release_year})`;
      const plot = inEnglish ? metadata.plot : metadata.plot_spanish;
      const formattedRuntime = `${Math.floor(metadata.runtime / 60)}h ${metadata.runtime % 60}m`;
      const dateOptions = {year: 'numeric', month: 'long', day: 'numeric'};
      const formattedReleaseDate = new Date(metadata.release_date).toLocaleDateString(inEnglish ? "en-EN" : "es-ES", dateOptions); 
      const genres = inEnglish ? metadata.genres : metadata.genres_spanish;

      setDetailsContent((
        <>
          <TrailerPlayer 
            width={viewportWidth / 2}
            height={viewportWidth / 2 * 3/5}
            metadata={metadata} 
          />

          <Container fluid className='p-4'>
            <Row className='mt-1'>
              <Col className='d-flex align-items-center'>
                <a 
                  href={url} 
                  className='info-button-play rounded'
                  style={{ textDecoration: 'none', fontSize: '1.25vw', background: 'white', color: 'black', padding: '0.75%' }} 
                >
                  <div href={url} className='d-flex align-items-center justify-content-center'>
                    <i className='fa-solid fa-circle-play info-icon-play-details sibling mx-1'/>
                    <div className='sibling mx-1'>{strings['play'][language]}</div>
                  </div>
                </a>
                <i 
                  onClick={() => { alert('Add to watchlist was clicked'); }} 
                  className='fa-solid fa-circle-plus info-button ms-3'
                  style={{ fontSize: '2.2vw' }}
                />
              </Col>
            </Row>
            <Row className='mt-4'>
              <Col><div className='fs-5'>{titleAndYear}</div></Col>
            </Row>
            <Row className='mt-3'>
              <Col>{plot}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><hr className='divider div-arrow-down'></hr></Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{strings['runtime_short'][language]}:</span> {formattedRuntime}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{strings['release_date'][language]}:</span> {formattedReleaseDate}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{strings['genres'][language]}:</span> {genres.join(', ')}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{strings['cast'][language]}:</span> {metadata.cast.join(', ')}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{strings['writers'][language]}:</span> {metadata.writers.join(', ')}</Col>
            </Row>
            <Row className='mt-2'>
              <Col><span style={spanStyles}>{strings['directors'][language]}:</span> {metadata.directors.join(', ')}</Col>
            </Row>
          </Container>
        </>
      ));
    }
    else {
      setDetailsContent(<div/>);
    }
  }, [activeDetails]);


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
          number={number}
          metadata={metadata}
          language={language}
          openDetails={openDetails}
          onOpenDetails={setActiveDetails}
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

      <Container fluid style={props.style}>{rows}</Container>
    
      <Modal
        show={openDetails}
        onHide={() => setActiveDetails(HIDE_DETAILS)}
        dialogClassName='details-modal'
      >
        <Modal.Body
          style={{
            backgroundColor: BACKGROUND_COLOR,
            color: 'white',
            padding: 0,
            margin: 0
          }}
        >
          {detailsContent}
        </Modal.Body>
      </Modal>
    </>
  );
}