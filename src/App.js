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
    docViewer.loadDocument('/files/example_document.pdf');

    setDocViewer(docViewer);

    docViewer.on('documentLoaded', async () => {
      console.log('document loaded');
      docViewer.setToolMode(docViewer.getTool('AnnotationEdit'));
      setAnnotManager(docViewer.getAnnotationManager());
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
