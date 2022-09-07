import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import Modal from 'simple-react-modal';
import SearchContainer from './components/SearchContainer';
import { ReactComponent as ZoomIn } from './assets/icons/ic_zoom_in_black_24px.svg';
import { ReactComponent as ZoomOut } from './assets/icons/ic_zoom_out_black_24px.svg';
import { ReactComponent as AnnotationRectangle } from './assets/icons/ic_annotation_square_black_24px.svg';
import { ReactComponent as AnnotationRedact } from './assets/icons/ic_annotation_add_redact_black_24px.svg';
import { ReactComponent as AnnotationApplyRedact} from './assets/icons/ic_annotation_apply_redact_black_24px.svg';
import { ReactComponent as Search } from './assets/icons/ic_search_black_24px.svg';
import { ReactComponent as Select } from './assets/icons/ic_select_black_24px.svg';
import { ReactComponent as AddParagraph } from './assets/icons/ic_paragraph_24px.svg';
import './App.css';
import 'react-quill/dist/quill.snow.css';

const App = () => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const searchTerm = useRef(null);
  const searchContainerRef = useRef(null);

  const [documentViewer, setDocumentViewer] = useState(null);
  const [annotationManager, setAnnotationManager] = useState(null);
  const [searchContainerOpen, setSearchContainerOpen] = useState(false);

  const [editBoxAnnotation, setEditBoxAnnotation] = useState(null);
  const [editBoxCurrentValue, setEditBoxCurrentValue] = useState(null);

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
      documentViewer.setToolMode(documentViewer.getTool(Core.Tools.ToolNames.EDIT));
      setAnnotationManager(documentViewer.getAnnotationManager());
    });
  }, []);

  const zoomOut = () => {
    documentViewer.zoomTo(documentViewer.getZoom() - 0.25);
  };

  const zoomIn = () => {
    documentViewer.zoomTo(documentViewer.getZoom() + 0.25);
  };

  const addParagraph = () => {
    const addParagraphTool = documentViewer.getTool(window.Core.Tools.ToolNames.ADD_PARAGRAPH);
    documentViewer.setToolMode(addParagraphTool);
  };

  const createRectangle = () => {
    documentViewer.setToolMode(documentViewer.getTool(window.Core.Tools.ToolNames.RECTANGLE));
  };

  const selectTool = () => {
    documentViewer.setToolMode(documentViewer.getTool(window.Core.Tools.ToolNames.EDIT));
  };

  const createRedaction = () => {
    documentViewer.setToolMode(documentViewer.getTool(window.Core.Tools.ToolNames.REDACTION));
  };

  const applyRedactions = async () => {
    const annotationManager = documentViewer.getAnnotationManager();
    annotationManager.enableRedaction();
    await annotationManager.applyRedactions();
  };

  const richTextEditorChangeHandler = (value) => {
    setEditBoxCurrentValue(value);
  };

  const applyEditModal = () => {
    window.Core.ContentEdit.updateDocumentContent(editBoxAnnotation, editBoxCurrentValue);

    setEditBoxAnnotation(null);
    setEditBoxCurrentValue(null);
  };

  const editSelectedBox = async () => {
    const selectedAnnotations = documentViewer.getAnnotationManager().getSelectedAnnotations();
    const selectedAnnotation = selectedAnnotations[0];

    if (selectedAnnotation &&
      selectedAnnotation.isContentEditPlaceholder() &&
      selectedAnnotation.getContentEditType() === window.Core.ContentEdit.Types.TEXT) {
      const content = await window.Core.ContentEdit.getDocumentContent(selectedAnnotation);
      setEditBoxAnnotation(selectedAnnotation);
      setEditBoxCurrentValue(content);
    } else {
      alert('Text edit box is not selected');
    }
  };

  const toolbarOptions = [['bold', 'italic', 'underline']];

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
          <button onClick={addParagraph} title="Add new paragraph">
            <AddParagraph />
          </button>
          <button onClick={editSelectedBox} title="Edit selected box">
            Edit Box
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
        <Modal show={!!editBoxCurrentValue} style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
          <ReactQuill
            value={editBoxCurrentValue}
            onChange={richTextEditorChangeHandler}
            modules={{ toolbar: toolbarOptions }}
          />
          <button onClick={applyEditModal}>
            Apply
          </button>
        </Modal>
        <div className="flexbox-container" id="scroll-view" ref={scrollView}>
          <div id="viewer" ref={viewer}></div>
        </div>
      </div>
      <div className="flexbox-container">
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
