import React, { useRef, useEffect, useState } from 'react';
import ZoomIn from './assets/icons/ic_zoom_in_black_24px.svg'
import ZoomOut from './assets/icons/ic_zoom_out_black_24px.svg'
import AnnotationRectangle from './assets/icons/ic_annotation_rectangular_area_black_24px.svg'
import AnnotationRedact from './assets/icons/ic_annotation_add_redact_black_24px.svg'
import AnnotationApplyRedact from './assets/icons/ic_annotation_apply_redact_black_24px.svg'
import ClearSearch from './assets/icons/ic_close_black_24px.svg'
import LeftChevronArrow from './assets/icons/ic_chevron_left_black_24px.svg'
import RightChevronArrow from './assets/icons/ic_chevron_right_black_24px.svg'
import Select from './assets/icons/ic_select_black_24px.svg'
import Search from './assets/icons/ic_search_black_24px.svg'
import './App.css';

const App = () => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const searchTerm = useRef(null);

  const [docViewer, setDocViewer] = useState(null);
  const [annotManager, setAnnotManager] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);

  const Annotations = window.Annotations;

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    const CoreControls = window.CoreControls;
    CoreControls.setWorkerPath('/webviewer');
    CoreControls.enableFullPDF(true);

    const docViewer = new CoreControls.DocumentViewer();
    docViewer.setScrollViewElement(scrollView.current);
    docViewer.setViewerElement(viewer.current);
    docViewer.setOptions({ enableAnnotations: true });
    docViewer.loadDocument('/files/pdftron_about.pdf');

    setDocViewer(docViewer);
  
    docViewer.on('documentLoaded', () => {
      console.log('document loaded');
      docViewer.setToolMode(docViewer.getTool('AnnotationEdit'));
      setAnnotManager(docViewer.getAnnotationManager());
    });
  }, []);

  /**
   * Coupled with the function `changeActiveSearchResult`
   */
  useEffect(() => {
    if (activeResultIndex && activeResultIndex >= 0) {
      docViewer.setActiveSearchResult(searchResults[activeResultIndex]);
    }
  }, [ activeResultIndex ]);

  const zoomOut = () => {
    docViewer.zoomTo(docViewer.getZoom() - 0.25);
  };

  const zoomIn = () => {
    docViewer.zoomTo(docViewer.getZoom() + 0.25);
  };

  const createRectangle = () => {
    docViewer.setToolMode(docViewer.getTool('AnnotationCreateRectangle'));
  };

  const selectTool = () => {
    docViewer.setToolMode(docViewer.getTool('AnnotationEdit'));
  };

  const createRedaction = () => {
    docViewer.setToolMode(docViewer.getTool('AnnotationCreateRedaction'));
  };

  const applyRedactions = async () => {
    const annotManager = docViewer.getAnnotationManager();
    annotManager.enableRedaction(true);
    await annotManager.applyRedactions();
  };

  const performSearch = () => {
    clearSearchResults(false);
    const {
      current: {
        value: textToSearch
      }
    } = searchTerm;
    const {
      SearchMode: {
        e_page_stop: ePageStop,
        e_highlight: eHighlight,
      },
    } = docViewer;
    const mode = ePageStop | eHighlight;
    const fullSearch = true;
    let jumped = false;
    docViewer.textSearchInit(textToSearch, mode, {
      fullSearch,
      onResult: result => {
        setSearchResults(prevState => [...prevState, result]);
        const {
          resultCode,
          quads,
          // The page number in the callback parameter is 0-indexed
          page_num: zeroIndexedPageNum,
        } = result;
        const {
          e_found: eFound,
        } = window.PDFNet.TextSearch.ResultCode
        const pageNumber = zeroIndexedPageNum + 1;
        if (resultCode === eFound) {
          const highlight = new Annotations.TextHighlightAnnotation();
          /**
           * The page number in Annotations.TextHighlightAnnotation is not
           * 0-indexed
           */
          highlight.setPageNumber(pageNumber);
          highlight.Quads.push(quads[0].getPoints());
          annotManager.addAnnotation(highlight);
          annotManager.drawAnnotations(highlight.PageNumber);
          if (!jumped) {
            jumped = true;
            // This is the first result found, so set `activeResult` accordingly
            setActiveResultIndex(0);
            docViewer.displaySearchResult(result, () => {
              /**
               * The page number in docViewer.displayPageLocation is not
               * 0-indexed
               */
              docViewer.displayPageLocation(pageNumber, 0, 0, true);
            });
          }
        }
      }
    });
  };

  /**
   * Side-effect function that invokes the internal functions to clear the
   * search results
   *
   * @param {Boolean} clearSearchTermValue For the guard clause to determine
   * if `searchTerm.current.value` should be mutated (would not want this to
   * occur in the case where a subsequent search is being performed after a
   * previous search)
   */
  const clearSearchResults = (clearSearchTermValue = true) => {
    if (clearSearchTermValue) {
      searchTerm.current.value = '';
    }
    docViewer.clearSearchResults();
    annotManager.deleteAnnotations(annotManager.getAnnotationsList());
    setSearchResults([]);
    setActiveResultIndex(-1);
  };

  /**
   * Checks if the key that has been released was the `Enter` key, and invokes
   * `performSearch` if so
   *
   * @param {SyntheticEvent} event The event passed from the `input` element
   * upon the function being invoked from a listener attribute, such as
   * `onKeyUp`
   */
  const listenForEnter = (event) => {
    const {
      keyCode,
    } = event;
    // The key code for the enter button
    if (keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      performSearch();
    }
  };

  /**
   * Changes the active search result in `docViewer`
   *
   * @param {Number} newSearchResult The index to set `activeResult` to,
   * indicating which `result` object that should be passed to
   * `docViewer.setActiveSearchResult`
   */
  const changeActiveSearchResult = (newSearchResult) => {
    /**
     * @todo Figure out why only the middle set of search results can be
     * iterated through, but not the first or last results.
     */
    /**
     * Do not try to set a search result that is outside of the index range of
     * searchResults
     */
    if (newSearchResult >= 0 && newSearchResult < searchResults.length) {
      setActiveResultIndex(newSearchResult);
    }
  };

  const prevSearchResult = () => {
    changeActiveSearchResult(activeResultIndex - 1);
  }

  const nextSearchResult = () => {
    changeActiveSearchResult(activeResultIndex + 1);
  }

  return (
    <div className="App">
      <div>
        <button onClick={zoomOut}><img src={ZoomOut} alt="Zoom Out"/></button>
        <button onClick={zoomIn}><img src={ZoomIn} alt="Zoom In"/></button>
        <button onClick={createRectangle}>
          <img src={AnnotationRectangle} alt="Create Rectangle"/>
        </button>
        <button onClick={createRedaction}>
          <img src={AnnotationRedact} alt="Create Redaction"/>
        </button>
        <button onClick={applyRedactions}>
          <img src={AnnotationApplyRedact} alt="Apply Redaction"/>
        </button>
        <button onClick={selectTool}>
          <img src={Select} alt="Select"/>
        </button>
        <input
          ref={searchTerm}
          type={'text'}
          placeholder={'Search'}
          onKeyUp={listenForEnter}
        ></input>
        <button onClick={performSearch}>
          <img src={Search} alt="Search"/>
        </button>
        <button
          onClick={prevSearchResult}
          disabled={activeResultIndex < 0}
        >
          <img src={LeftChevronArrow} alt="Previous Search Result"/>
        </button>
        <button
          onClick={nextSearchResult}
          disabled={activeResultIndex < 0}
        >
          <img src={RightChevronArrow} alt="Next Search Result"/>
        </button>
        <button onClick={clearSearchResults}>
          <img src={ClearSearch} alt="Clear Search"/>
        </button>
      </div>
      <div id="scroll-view" ref={scrollView}>
        <div id="viewer" ref={viewer}></div>
      </div>
    </div>
  );
};

export default App;
