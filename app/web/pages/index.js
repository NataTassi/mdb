import globalStyles from 'styles/App.global.js';
import useDebounce from 'utils/useDebounce';
import Results from 'components/Results';
import React, { useState } from 'react';
import { ENGLISH } from 'resources/strings';
import { jsonFetcher } from 'utils/api';
import Navbar from 'components/Navbar';
import useSWR from 'swr';


const DEBOUNCE_DELAY = 400;

function useResults(params) {
  const url = `/api/search/movies?${(new URLSearchParams(params)).toString()}`;
  console.debug(url);
  const { data, error } = useSWR(url, jsonFetcher);

  return {
    results: !error && data ? data.documents : [],
    loading: !error && !data,
    error: error
  }
}

export default function App() {
  const [language, setLanguage] = useState(ENGLISH);
  const [searchParams, setSearchParams] = useState({});
  const debouncedSearchParams = useDebounce(searchParams, DEBOUNCE_DELAY);
  const { results, loading, error } = useResults(debouncedSearchParams);
  const LanguageContext = React.createContext(language);

  return (
    <>
      <style jsx global>{globalStyles}</style>

      <Navbar 
        language={language} onLanguageChange={setLanguage} 
        searchParams={searchParams} onSearchParamsChange={setSearchParams} 
      />

      <Results 
        language={language}
        results={results} 
        loading={loading}
        error={error} 
        colsPerRow='6' 
        style={{ padding: '3% 7%' }}
      />
    </>
  );
}