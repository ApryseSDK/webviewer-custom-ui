import React, { useRef, useEffect, useState } from 'react';
import SearchContainer from './components/SearchContainer';
import { ReactComponent as ZoomIn } from './assets/icons/ic_zoom_in_black_24px.svg';
import { ReactComponent as ZoomOut } from './assets/icons/ic_zoom_out_black_24px.svg';
import { ReactComponent as AnnotationRectangle } from './assets/icons/ic_annotation_square_black_24px.svg';
import { ReactComponent as AnnotationRedact } from './assets/icons/ic_annotation_add_redact_black_24px.svg';
import { ReactComponent as AnnotationApplyRedact } from './assets/icons/ic_annotation_apply_redact_black_24px.svg';
import { ReactComponent as Search } from './assets/icons/ic_search_black_24px.svg';
import { ReactComponent as Select } from './assets/icons/ic_select_black_24px.svg';
import { ReactComponent as EditContent } from './assets/icons/ic_edit_page_24px.svg';
import { ReactComponent as AddParagraph } from './assets/icons/ic_paragraph_24px.svg';
import { ReactComponent as AddImageContent } from './assets/icons/ic_add_image_24px.svg';
import './App.css';

const App = () => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const searchTerm = useRef(null);
  const searchContainerRef = useRef(null);

  const [documentViewer, setDocumentViewer] = useState(null);
  const [annotationManager, setAnnotationManager] = useState(null);
  const [searchContainerOpen, setSearchContainerOpen] = useState(false);
  const [isInContentEditMode, setIsInContentEditMode] = useState(false);

  const Annotations = window.Core.Annotations;

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    const Core = window.Core;
    Core.setWorkerPath('/webviewer');
    Core.enableFullPDF();

    const documentViewer = new Core.DocumentViewer();
    documentViewer.setScrollViewElement(scrollView.current);
    documentViewer.setViewerElement(viewer.current);
    documentViewer.setOptions({ enableAnnotations: true });
    documentViewer.loadDocument('/files/pdftron_about.pdf');

    setDocumentViewer(documentViewer);

    documentViewer.addEventListener('documentLoaded', () => {
      console.log('document loaded');
      setAnnotationManager(documentViewer.getAnnotationManager());
      documentViewer.setFitMode(Core.DocumentViewer.FitMode.FitWidth);
      documentViewer.setLayoutMode(Core.DocumentViewer.LayoutMode.Single);
    });
  }, []);

  const zoomOut = () => {
    documentViewer.zoomTo(documentViewer.getZoom() - 0.25);
  };

  const zoomIn = () => {
    documentViewer.zoomTo(documentViewer.getZoom() + 0.25);
  };

  const prevPage = () => {
    if (documentViewer.getCurrentPage() - 1 > 0) {
      documentViewer.setCurrentPage(
        Math.max(documentViewer.getCurrentPage() - 1, 1)
      );
    }
  };

  const nextPage = () => {
    if (documentViewer.getCurrentPage() + 1 <= documentViewer.getPageCount()) {
      documentViewer.setCurrentPage(
        Math.min(documentViewer.getCurrentPage() + 1, documentViewer.getPageCount())
      );
    }
  };

  const selectTool = () => {
    documentViewer.setToolMode(
      documentViewer.getTool(window.Core.Tools.ToolNames.EDIT)
    );
  };

  return (
    <div className='App'>
      <button onClick={prevPage}>Prev</button>
      <div id='main-column'>
        <div className='center' id='tools'>
          <button onClick={zoomOut}>
            <ZoomOut />
          </button>
          <button onClick={zoomIn}>
            <ZoomIn />
          </button>
          <button onClick={selectTool}>
            <Select />
          </button>
          <button
            onClick={() => {
              // Flip the boolean
              setSearchContainerOpen((prevState) => !prevState);
            }}
          >
            <Search />
          </button>
        </div>
        <div className='flexbox-container' id='scroll-view' ref={scrollView}>
          <div id='viewer' ref={viewer}></div>
        </div>
      </div>
      <button onClick={nextPage}>Next</button>
      <div className='flexbox-container'>
        <SearchContainer
          Annotations={Annotations}
          annotationManager={annotationManager}
          documentViewer={documentViewer}
          searchTermRef={searchTerm}
          searchContainerRef={searchContainerRef}
          open={searchContainerOpen}
        />
      </div>
    </div>
  );
};

export default App;
