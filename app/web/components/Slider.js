import React, { useRef } from 'react';

import { Range, getTrackBackground } from 'react-range';

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


export default function Slider(props) {
  const rangeRef = useRef(null);
  const values = props.values;

  return (
    <>
      <Range
        ref={rangeRef}
        values={values}
        step={1}
        min={props.min}
        max={props.max}
        onChange={newValues => props.onChange(newValues)}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
              height: '26px',
              display: 'flex',
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: '4px'
            }}
          >
            <div
              ref={props.ref}
              style={{
                height: '5px',
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values,
                  colors: ['#ccc', '#548BF4', '#ccc'],
                  min: props.min,
                  max: props.max
                }),
                alignSelf: 'center'
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '32px',
              width: '32px',
              borderRadius: '4px',
              backgroundColor: '#FFF',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0px 2px 6px #AAA'
            }}
          >
            <div
              style={{
                height: '12px',
                width: '5px',
                backgroundColor: isDragged ? '#548BF4' : '#CCC'
              }}
            />
          </div>
        )}
      />

      <Container fluid className='mt-3'>
        <Row>
          <Col className='d-flex justify-content-center'>
            <Form.Control 
              required type='number' min={props.min} max={values[1]} value={values[0]} size={6} 
              onChange={e => {
                const newValues = values.slice();
                const newMin = Number(e.target.value);
                newValues[0] = newMin;

                if (newMin >= props.min && newMin <= values[1]) {
                  rangeRef.current.props.onChange(newValues);
                }
              }}
            />
          </Col>

          <Col className='d-flex justify-content-center'>
            <Form.Control 
              required type='number' min={values[0]} max={props.max} value={values[1]} size={6}
              onChange={e => {
                const newValues = values.slice();
                const newMax = Number(e.target.value);
                newValues[1] = newMax;
                
                if (newMax >= values[0] && newMax <= props.max) {
                  rangeRef.current.props.onChange(newValues);
                }
              }}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}