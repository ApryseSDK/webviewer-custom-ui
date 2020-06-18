import React from 'react';

const SearchContainer = (props) => {
  const {
    open = false,
  } = props;

  if (!open) {
    return (null);
  }

  return (
    <div>Hello World</div>
  );
};

export default SearchContainer;
