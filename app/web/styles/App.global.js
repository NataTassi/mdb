import css from 'styled-jsx/css';

export default css.global`
  body {
    overflow-y: scroll;
    background-color: #111111;
  }

  // Remove glow from search box:
  .form-control:focus {
    border-color: white;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(200, 200, 200, 0.0);
  }

  // Remove clear button from search box:
  input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }

  .dropdown-menu {
    min-width: 1rem;
  }

  .vertical-center {
    margin: 0;
    position: absolute;
    top: 40%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }
`;