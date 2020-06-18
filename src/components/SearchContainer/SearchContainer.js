import React from 'react';

const SearchContainer = (props) => {
  const {
    open = false,
    searchContainerRef,
  } = props;

  if (!open) {
    return (null);
  }

  return (
    <div
      ref={searchContainerRef}
    >
      Hello World
    </div>
  );
};

export default SearchContainer;
