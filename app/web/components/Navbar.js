import React, { useEffect, useState, useRef } from 'react';

// Fix 'Warning: useLayoutEffect does nothing on the server...':
React.useLayoutEffect = React.useEffect;

import { strings, ENGLISH, SPANISH } from 'model/strings';

import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { jsonFetcher } from 'utils/api';
import useSWR from 'swr';

import FloatingLabel from 'react-bootstrap/FloatingLabel';
import FormControl from 'react-bootstrap/FormControl';
import NavDropdown from 'react-bootstrap/NavDropdown';
import NavbarBootstrap from 'react-bootstrap/Navbar';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Slider from 'components/Slider';


const YEAR_MIN = 1900;
const YEAR_MAX = new Date().getFullYear();

const RUNTIME_MIN = 15;
const RUNTIME_MAX = 240;

export default function Navbar(props) {
  const language = props.language;

  const titleRef = useRef(null);
  const genreRef = useRef(null);
  const filmSeriesRef = useRef(null);
  const plotRef = useRef(null);
  const actorRef = useRef(null);
  const writerRef = useRef(null);
  const directorRef = useRef(null);

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const actors = useSWR('/api/aggregation/actors', jsonFetcher);
  const writers = useSWR('/api/aggregation/writers', jsonFetcher);
  const directors = useSWR('/api/aggregation/directors', jsonFetcher);
  const filmSeries = useSWR('/api/aggregation/film_series', jsonFetcher);
  const genres = useSWR(`/api/aggregation/${strings['genre_api_param'][language]}`, jsonFetcher);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === '/') {
        if (titleRef.current !== document.activeElement) {
          titleRef.current.focus();
          window.scrollTo({ top: 0 });
          event.preventDefault();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const languageIcon = <i className='fa-solid fa-globe' style={{ fontSize: 20, color: 'white' }} />;
  const userIcon = <i className='fa-solid fa-user' style={{ fontSize: 20, color: 'white' }} />;

  const genresOptions = [];

  genresOptions.push(<option key={0} value="">{strings['all'][language]}</option>);

  if (!genres.error && genres.data) {
    let key = 1;

    for (const genre of genres.data) {
      genresOptions.push(<option key={key} value={genre}>{genre}</option>);
      key++;
    }
  }

  const updateParam = (param, value) => {
    const newParams = { ...props.searchParams };

    if (value) newParams[param] = value;
    else delete newParams[param];

    props.onSearchParamsChange(newParams);
  };

  const updateParams = params => {
    const newParams = { ...props.searchParams };

    for (const [param, value] of Object.entries(params)) {
      if (value) newParams[param] = value;
      else delete newParams[param];
    }

    props.onSearchParamsChange(newParams);
  };

  return (
    <>
      <NavbarBootstrap className='p-3 bg-black'>
        <Container fluid>
          <Col className='d-flex align-items-center'>
            <NavbarBootstrap.Brand href="/" className='text-light fs-3 mx-4'>MDb</NavbarBootstrap.Brand>
            <Nav.Link href="/">
              <i className='fa-solid fa-house mx-3' style={{ fontSize: 20, color: 'white' }} />
            </Nav.Link>
            <Nav.Link href="/watchlist">
              <i className='fa-solid fa-clock mx-3' style={{ fontSize: 20, color: 'white' }} />
            </Nav.Link>
          </Col>

          <Col>
            <Form onSubmit={(e) => e.preventDefault()}>
              <InputGroup>
                <Button variant='dark' className='border' onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                  <i className='fa-solid fa-angle-down' style={{ fontSize: 15, color: 'white' }} />
                </Button>

                <FormControl
                  ref={titleRef}
                  autoFocus
                  type='search'
                  value={props.searchParams.title}
                  onChange={e => updateParam('title', e.target.value)}
                  placeholder={strings['title'][language]}
                  className='bg-dark text-light'
                />

                <InputGroup.Text className='bg-dark'>
                  <i className='fa-solid fa-magnifying-glass' style={{ fontSize: 15, color: 'white' }} />
                </InputGroup.Text>
              </InputGroup>
            </Form>
          </Col>

          <Col className='d-flex align-items-center justify-content-end'>
            <NavDropdown title={languageIcon} className='text-break mx-3' align='end'>
              <NavDropdown.Item active={language == ENGLISH} onClick={() => props.onLanguageChange(ENGLISH)}>
                English
              </NavDropdown.Item>
              <NavDropdown.Item active={language == SPANISH} onClick={() => props.onLanguageChange(SPANISH)}>
                Español
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title={userIcon} className='text-break mx-3' align='end'>
              <NavDropdown.Item>Profile 1</NavDropdown.Item>
              <NavDropdown.Item>Profile 2</NavDropdown.Item>
              <NavDropdown.Item>Profile 3</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href='/settings'>{strings['settings'][language]}</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/logout">{strings['log_out'][language]}</NavDropdown.Item>
            </NavDropdown>
          </Col>
        </Container>
      </NavbarBootstrap>

      <div style={{ overflow: 'hidden' }}>
        <Container 
          fluid  
          style={{ 
            marginTop: showAdvancedOptions ? '0' : '-50%',
            transition: 'all 1.5s ease-out',
           }}
        >
          <Row>
            <Col className='my-4 d-flex justify-content-center'>
              <Button
                variant="secondary"
                onClick={() => {
                  titleRef.current.value = '';
                  genreRef.current.selectedIndex = 0;
                  filmSeriesRef.current.clear();
                  plotRef.current.value = '';
                  actorRef.current.clear();
                  writerRef.current.clear();
                  directorRef.current.clear();
                  props.onSearchParamsChange({});
                }}
              >
                {strings['clear_filters'][language]}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col className='px-3 d-flex align-items-center'>
              <div className='w-100'>
                <FloatingLabel controlId='genre' label={strings['genre'][language]}>
                  <Form.Select
                    ref={genreRef}
                    aria-label={strings['genre'][language]}
                    onChange={e => updateParam('genre', genreRef.current.selectedIndex == 0 ? '' : e.target.value)}
                  >
                    {genresOptions}
                  </Form.Select>
                </FloatingLabel>

                <Form.Label className='mt-3 text-light' htmlFor='film_series'>
                  {strings['film_series'][language]}
                </Form.Label>
                <Typeahead
                  id='film_series'
                  ref={filmSeriesRef}
                  placeholder={strings['none'][language]}
                  onInputChange={value => updateParam('film_series', value)}
                  onChange={selected => updateParam('film_series', selected.length > 0 ? selected[0] : null)}
                  options={!filmSeries.error && filmSeries.data ? filmSeries.data : []}
                  isLoading={!filmSeries.data && !filmSeries.error}
                  className='mb-3'
                />

                <FloatingLabel className='mt-4' controlId="plot" label={strings['plot_keywords'][language]}>
                  <Form.Control
                    ref={plotRef}
                    placeholder={strings['plot_keywords'][language]}
                    onChange={e => updateParam('plot', e.target.value)}
                  />
                </FloatingLabel>
              </div>
            </Col>

            <Col className='px-5'>
              <Form.Label className='text-light' htmlFor='actor'>
                {strings['actor'][language]}
              </Form.Label>
              <Typeahead
                id='actor'
                ref={actorRef}
                placeholder={strings['any'][language]}
                onInputChange={value => updateParam('actor', value)}
                onChange={selected => updateParam('actor', selected.length > 0 ? selected[0] : null)}
                options={!actors.error && actors.data ? actors.data : []}
                isLoading={!actors.data && !actors.error}
                className='mb-3'
              />

              <Form.Label className='text-light' htmlFor='writer'>
                {strings['writer'][language]}
              </Form.Label>
              <Typeahead
                id='writer'
                ref={writerRef}
                placeholder={strings['any'][language]}
                onInputChange={value => updateParam('writer', value)}
                onChange={selected => updateParam('writer', selected.length > 0 ? selected[0] : null)}
                options={!writers.error && writers.data ? writers.data : []}
                isLoading={!writers.data && !writers.error}
                className='mb-3'
              />

              <Form.Label className='text-light' htmlFor='director'>
                {strings['director'][language]}
              </Form.Label>
              <Typeahead
                id='director'
                ref={directorRef}
                placeholder={strings['any'][language]}
                onInputChange={value => updateParam('director', value)}
                onChange={selected => updateParam('director', selected.length > 0 ? selected[0] : null)}
                options={!directors.error && directors.data ? directors.data : []}
                isLoading={!directors.data && !directors.error}
              />
            </Col>

            <Col className='px-5'>
              <Form.Label className='text-light' htmlFor='release'>
                {strings['release'][language]}
              </Form.Label>
              <Slider
                id='release'
                min={YEAR_MIN} max={YEAR_MAX}
                values={[
                  props.searchParams['release_year_start'] ? props.searchParams['release_year_start'] : YEAR_MIN,
                  props.searchParams['release_year_end'] ? props.searchParams['release_year_end'] : YEAR_MAX
                ]}
                onChange={values => updateParams({
                  'release_year_start': values[0],
                  'release_year_end': values[1]
                })}
              />

              <Form.Label className='mt-5 text-light' htmlFor='runtime'>
                {strings['runtime'][language]}
              </Form.Label>
              <Slider
                id='runtime'
                min={RUNTIME_MIN} max={RUNTIME_MAX}
                values={[
                  props.searchParams['runtime_start'] ? props.searchParams['runtime_start'] : RUNTIME_MIN,
                  props.searchParams['runtime_end'] ? props.searchParams['runtime_end'] : RUNTIME_MAX
                ]}
                onChange={values => updateParams({
                  'runtime_start': values[0],
                  'runtime_end': values[1]
                })}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </>
  )
}