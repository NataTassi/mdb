import Container from 'react-bootstrap/Container';
import Result from 'components/Result';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import React from 'react';


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
    <Container fluid style={props.style}>{rows}</Container>
  );
}