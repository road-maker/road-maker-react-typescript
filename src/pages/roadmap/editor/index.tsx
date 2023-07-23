/* eslint-disable no-console */
import { RichTextEditor } from '@mantine/tiptap';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ReactElement, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { styled } from 'styled-components';

import { useInput } from '../../../components/common/hooks/useInput';
import RoadMapCanvas from '../../../components/editor/RoadMapEditor';

export default function RoadMapEditor(): ReactElement {
  const [state, onChangeHandler, setState] = useInput('');
  const ydoc = useRef(null);
  const ytext = useRef(null);
  // useEffect(() => {
  //   ydoc.current = new Y.Doc();
  //   const wsProvider = new WebsocketProvider(
  //     'ws://localhost:1234',
  //     // 'ws://192.168.177.1:1234',
  //     'stawp',
  //     ydoc.current,
  //     { connect: true, maxBackoffTime: 0 },
  //   );

  //   // wsProvider.on('status', (event) => {
  //   //   console.log(event.status); // logs "connected" or "disconnected"
  //   // });
  //   wsProvider.shouldConnect = false;

  //   ytext.current = ydoc.current.getText('600');
  //   ytext.current.observe(() => {
  //     console.log(ytext.current.toString());
  //     setState(ytext.current.toString());
  //     onChangeHandler(ytext.current.toString());
  //   });
  //   // return () => {
  //   //   wsProvider.destroy();
  //   // };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Placeholder.configure({ placeholder: 'This is placeholder' }),
      //   Underline,
      //   Link,
      //   Superscript,
      //   SubScript,
      //   Highlight,
      //   TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    // content: state,
    content: `<div onChange={onChangeHandler}>${state}</div>`,
    onUpdate(e) {
      console.log('ydoc', ydoc);
      console.log('ytext', ytext);
      console.log(e.editor?.getHTML());
      setState(e.editor?.getHTML());
    },
  });

  return (
    <EditorWrap>
      <div>
        {/* <BasicTest
          state={state}
          setState={setState}
          ydoc={ydoc}
          ytext={ytext}
        /> */}

        <div>
          <RichTextEditor editor={editor}>
            <RichTextEditor.Toolbar sticky stickyOffset={5}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
                <RichTextEditor.Code />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignJustify />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
            <div className="content">
              <RichTextEditor.Content />
            </div>
          </RichTextEditor>
        </div>
      </div>
      <div className="roadMapWrap">
        <ReactFlowProvider>
          <RoadMapCanvas
            // state={state}
            editor={state}
            setState={setState}
            onChange={onChangeHandler}
            // ydoc={ydoc}
            // ytext={ytext}
          />
        </ReactFlowProvider>
      </div>
    </EditorWrap>
  );
}
const EditorWrap = styled.div`
  display: inline-flex;
  width: 100vw;
  height: 100vh;
  & .editor {
    & > .content {
      width: 100%;
      /* height: 85vh; */
      overflow-y: scroll;
      /*
      ::-webkit-scrollbar {
        width: 0.2rem;
      }
      ::-webkit-scrollbar-thumb {
        height: 30%;
        background-color: '#cee6f3';
      }
      ::-webkit-scrollbar-track {
        background-color: '#cee6f3';
      } */
    }
  }

  & .roadMapWrap {
    /* height: 100%; */
    width: 100%;
  }
`;