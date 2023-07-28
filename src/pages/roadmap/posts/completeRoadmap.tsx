/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ReactElement, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { styled } from 'styled-components';

import { useInput } from '../../../components/common/hooks/useInput';
import InteractionFlow from './userRoadmap';

export default function CompleteRoadmap(): ReactElement {
  // const { search } = useLocation();
  const [label, onChangeLabel, setLabel] = useInput('');
  const [id, onChangeId, setId] = useInput('');
  // const [toggle, setToggle] = useState(null);
  const [toggle, onChangeToggle, setToggle] = useInput('');
  const [search] = useSearchParams();
  // const [state, onChangeHandler, setState] = useInput('');
  const [state, setState] = useState([
    { id: '1', details: `<div>자바스크립트</div>` },
    { id: '2', details: `<div>'함수 개념과 활용법'</div>` },
    { id: '2b', details: `<div>'자바스크립트 상세'</div>` },
    { id: '2c', details: `<div>'조건문과 반복문 상세'</div>` },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roadMapTitle, onRoadMapTitleChange, setRoadMapTitle] = useInput(
    search.get('title') || '',
  );
  const ydoc = useRef(null);
  const ytext = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Underline,
      Link,
      Superscript,
      Subscript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: state.filter((v) => v.id === id)[0]?.details || '',
    onUpdate(e) {
      setToggle(e.editor?.getHTML());
      // eslint-disable-next-line array-callback-return
      state.map((item, idx) => {
        if (item.id !== id) return;

        const copyState = [...state];
        copyState.splice(idx, 1, {
          id: item.id,
          details: e.editor?.getHTML(),
        });
        setState(copyState);
      });
    },
  });
  useMemo(() => {
    const filt = state.filter((v) => v.id === id);
    setToggle(filt);
    if (editor) {
      editor.commands.setContent(filt[0]?.details || '');
    }

    if (label !== '' && filt.length === 0) {
      setState([...state, { id, details: '' }]);
    }
    // console.log('state', state);
  }, [state, id, setToggle, label, editor]);

  return (
    <EditorWrap>
      <div className="roadMapWrap">
        <ReactFlowProvider>
          <InteractionFlow
            state={state}
            editor={editor}
            id={id}
            onChangeId={onChangeId}
            setId={setId}
            label={label}
            onChangeLabel={onChangeLabel}
            setLabel={setLabel}
            setState={setState}
          />
        </ReactFlowProvider>
      </div>
    </EditorWrap>
  );
}

const EditorWrap = styled.div`
  & .editor {
    & > .content {
      width: 100%;
    }
  }

  & .roadMapWrap {
    overflow-x: hidden;
  }
`;