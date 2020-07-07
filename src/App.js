import React, { useRef, useEffect, useState } from 'react';
import SearchContainer from './components/SearchContainer';
import { ReactComponent as ZoomIn } from './assets/icons/ic_zoom_in_black_24px.svg';
import { ReactComponent as ZoomOut } from './assets/icons/ic_zoom_out_black_24px.svg';
import { ReactComponent as AnnotationRectangle } from './assets/icons/ic_annotation_square_black_24px.svg';
import { ReactComponent as AnnotationRedact } from './assets/icons/ic_annotation_add_redact_black_24px.svg';
import { ReactComponent as AnnotationApplyRedact} from './assets/icons/ic_annotation_apply_redact_black_24px.svg';
import { ReactComponent as Search } from './assets/icons/ic_search_black_24px.svg';
import { ReactComponent as Select } from './assets/icons/ic_select_black_24px.svg';
import './App.css';

const App = () => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const searchTerm = useRef(null);
  const searchContainerRef = useRef(null);

  const [docViewer, setDocViewer] = useState(null);
  const [annotManager, setAnnotManager] = useState(null);
  const [searchContainerOpen, setSearchContainerOpen] = useState(false);
  /**
   * A state value cannot be accessed in an event handler, and needs a `ref` to
   * ensure the most current value is being accessed within the event handler
   *
   * https://stackoverflow.com/questions/55265255/react-usestate-hook-event-handler-using-initial-state
   */
  const [bookmarkCoordinates, _setBookmarkCoordinates] = useState({});
  const bookmarkCoordinatesRef = useRef(bookmarkCoordinates);
  const setBookmarkCoordinates = value => {
    bookmarkCoordinatesRef.current = value;
    _setBookmarkCoordinates(value);
  }

  const Annotations = window.Annotations;

  useEffect(() => {
    if (annotManager) {
      annotManager.on('annotationChanged', annotations => {
        const bookmarkCoordinates = bookmarkCoordinatesRef.current;
        const page = annotations[0].getPageNumber();
        const annotationYCoordinate = annotations[0].getY();
        /**
         * The page the annotation is made on has no bookmarks, find the last
         * bookmark of a previous page
         */
        if (!Object.keys(bookmarkCoordinates[page]).length) {
          let lastPageWithBookmark = page - 1;
          while (!bookmarkCoordinates[lastPageWithBookmark]) {
            lastPageWithBookmark -= 1;
          }
          const previousPageCoordinates = Object.keys(
            bookmarkCoordinates[lastPageWithBookmark]
          );
          const lowestBookmark = bookmarkCoordinates[lastPageWithBookmark][
            previousPageCoordinates[previousPageCoordinates.length - 1]
          ];
          console.log(
            `This annotation is a child of ${lowestBookmark.getName()}`
          );
          return;
        }
        // Perform a brute force search for the closest parent bookmark
        for (const [index, yCoordinate] of Object.keys(
          bookmarkCoordinates[page]
        ).entries()) {
          const bookmarkName = bookmarkCoordinates[page][yCoordinate].getName();
          /**
           * Account for an annotation that is above the first bookmark of a
           * page
           */
          if (
            index === 0
            // Don't attempt to access a previous page on the first page
            && page > 1
            && annotationYCoordinate < yCoordinate
          ) {
            const previousPageCoordinates = Object.keys(
              bookmarkCoordinates[page - 1]
            );
            const lowestBookmark = bookmarkCoordinates[page - 1][
              previousPageCoordinates[previousPageCoordinates.length - 1]
            ];
            console.log(
              `This annotation is a child of ${lowestBookmark.getName()}`
            );
            break;
          } else if (
            /**
             * Guard clause ensuring the logic does not attempt to access an
             * index beyond the length of the array
             *
             * Also account for an annotation that is drawn above the first
             * bookmark of the page
             */
            (
              Object.keys(bookmarkCoordinates[page]).length - 1 === index
              && annotationYCoordinate > Object.keys(bookmarkCoordinates[page])[0]
            ) || (
              // Ensure the reported bookmark is the closest parent
              annotationYCoordinate >= yCoordinate
              && annotationYCoordinate < Object.keys(bookmarkCoordinates[page])[
                index + 1
              ]
            )
          ) {
            console.log(`This annotation is a child of ${bookmarkName}`);
            break;
          }
        }
      });
    }
  }, [ annotManager ]);

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    const CoreControls = window.CoreControls;
    CoreControls.setWorkerPath('/webviewer');
    CoreControls.enableFullPDF(true);

    const docViewer = new CoreControls.DocumentViewer();
    docViewer.setScrollViewElement(scrollView.current);
    docViewer.setViewerElement(viewer.current);
    docViewer.setOptions({ enableAnnotations: true });
    docViewer.loadDocument('/files/example_document.pdf');

    setDocViewer(docViewer);

    docViewer.on('documentLoaded', async () => {
      console.log('document loaded');
      docViewer.setToolMode(docViewer.getTool('AnnotationEdit'));
      setAnnotManager(docViewer.getAnnotationManager());
      const doc = docViewer.getDocument();
      const bookmarks = await doc.getBookmarks();
      /**
       * Performs a recursive traversal of the Bookmark tree, printing out the
       * name, page number and y-coordinate of each bookmark, and stores the
       * page number, y-coordinate relationship in an Object for later access
       *
       * @param {Object} storage The Object to store the page number and
       * y-coordinate relationship in (passes by reference, per Javascript
       * standard)
       * @param {CoreControls.Bookmark} bookmark The current bookmark to print
       * and store in the `storage` Object
       * @param {Number} level The depth of the current bookmark
       */
      const printAndStoreBookmarkTree = (storage, bookmark, level = 0) => {
        const pageNumber = bookmark.getPageNumber();
        const name = bookmark.getName();
        /**
         * @todo Add support for X-Coordinate
         * const xCoordinate = bookmark.getHPos();
         */
        const yCoordinate = bookmark.getVPos();
        const children = bookmark.getChildren();
        const indent = '   '.repeat(level);
        storage[pageNumber][yCoordinate] = bookmark;
        console.log(
          `${indent}${name} (Page: ${pageNumber}, Y: ${yCoordinate})`
        );
        children.map(child => printAndStoreBookmarkTree(
          storage, child, level + 1
        ));
      };

      const storeBookmarkCoordinates = {};

      for (let i = 1; i <= doc.getPageCount(); i++) {
        storeBookmarkCoordinates[i] = {};
      }

      bookmarks.forEach(bookmark => {
        printAndStoreBookmarkTree(storeBookmarkCoordinates, bookmark);
      });

      setBookmarkCoordinates(storeBookmarkCoordinates);
    });
  }, []);

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

  return (
    <div className="App">
      <div id="main-column">
        <div className="center" id="tools">
          <button onClick={zoomOut}>
            <ZoomOut />
          </button>
          <button onClick={zoomIn}>
            <ZoomIn />
          </button>
          <button onClick={createRectangle}>
            <AnnotationRectangle />
          </button>
          <button onClick={createRedaction}>
            <AnnotationRedact />
          </button>
          <button onClick={applyRedactions}>
            <AnnotationApplyRedact />
          </button>
          <button onClick={selectTool}>
            <Select />
          </button>
          <button
            onClick={() => {
              // Flip the boolean
              setSearchContainerOpen(prevState => !prevState);
            }}
          >
            <Search />
          </button>
        </div>
        <div className="flexbox-container" id="scroll-view" ref={scrollView}>
          <div id="viewer" ref={viewer}></div>
        </div>
      </div>
      <div className="flexbox-container">
        <SearchContainer
          Annotations={Annotations}
          annotManager={annotManager}
          docViewer={docViewer}
          searchTermRef={searchTerm}
          searchContainerRef={searchContainerRef}
          open={searchContainerOpen}
        />
      </div>
    </div>
  );
};

export default App;
