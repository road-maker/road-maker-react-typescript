/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable array-callback-return */
import 'reactflow/dist/style.css';

import dagre from '@dagrejs/dagre';
import {
  ActionIcon,
  Button,
  Center,
  ColorInput,
  Image,
  Input,
  LoadingOverlay,
  Modal,
  Popover,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconCertificate,
  IconCircleArrowRightFilled,
  IconWand,
} from '@tabler/icons-react';
import axios from 'axios';
import { baseUrl } from 'axiosInstance/constants';
import { useRoadmap } from 'components/roadmaps/posts/hooks/useRoadmap';
import { useUser } from 'components/user/hooks/useUser';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import { setStoredRoadmap } from 'storage/roadmap-storage';
import { styled } from 'styled-components';

import { useInput } from '../common/hooks/useInput';
import { ResizableNodeSelected } from './ResizableNodeSelected';
import { RoadmapEdge, RoadmapNode, RoadmapNodes } from './types';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const flowKey = 'example-flow';

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node?.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge?.source, edge?.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node?.id);
    // eslint-disable-next-line no-param-reassign
    node.targetPosition = isHorizontal ? 'left' : 'top';
    // eslint-disable-next-line no-param-reassign
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    // eslint-disable-next-line no-param-reassign
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

const position = { x: 0, y: 0 };
const edgeType = 'smoothstep';
const nodeTypes = {
  custom: ResizableNodeSelected,
};
const initialNodes = [
  {
    id: '1',
    data: { label: 'test' },
    position: { x: 100, y: 100, zoom: 1 },
    type: 'custom',
    style: {
      background: '#fff',
      border: '1px solid black',
      borderRadius: 15,
      fontSize: 12,
    },
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 100, y: 200, zoom: 1 },
    type: 'custom',
    style: {
      background: '#fff',
      border: '1px solid black',
      borderRadius: 15,
      fontSize: 12,
    },
  },
];

const initialEdges = [
  { id: 'e11a', source: '1', target: '1a', type: edgeType, animated: true },
];
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

function Roadmap({
  editor,
  colorsState,
  setColorsState,
  label,
  color,
  onChangeColor,
  setColor,
  roadMapTitle,
  roadmapImage,
  roadmapDescription,
  roadmapTag,
  onRoadMapTitleChange,
  setRoadMapTitle,
  setLabel,
  blogKeyword,
  onChangeBlogKeyword,
  setBlogKeyword,
  toggleEditor,
  onChangeLabel,
  id,
  setState,
  state,
  onChangeId,
  setId,
  // selectedNode,
  // setSelectedNode,
}) {
  // const { prompt } = usePromptAnswer();

  const edgeSet = new Set<RoadmapEdge['id']>();
  const nodeSet = new Set<RoadmapNode['id']>();
  // const [nodeState, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [nodeState, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edgeState, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [title, onChangeTitle, setTitle] = useInput(''); // 로드맵 제목
  // const [thumbnail, onChangeThumbnail, setThumbnail] = useInput(''); // 썸네일
  const [desc, onChangeDesc, setDesc] = useInput('');
  const [gptRes, setGptRes] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [keywordSubmitState, setKeywordSubmitState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nodeBg, setNodeBg] = useState('#eee');
  const [nodeHidden, setNodeHidden] = useState(false);
  const [rfInstance, setRfInstance] = useState(null);
  const { setViewport, getViewport } = useReactFlow();
  const [useGpt, setUseGpt] = useState([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [nodeModal, setNodeModal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [currentFlow, setCurrentFlow] = useState('');
  const [gptDisabled, setGptDisabled] = useState(false);
  const [currentView, setCurrentView] = useState({ x: 0, y: 0, zoom: 1 });
  const yPos = useRef(currentView.y);
  const [selectedData, setSelectedData] = useState([
    { value: 'react', label: 'React' },
    { value: 'ng', label: 'Angular' },
  ]);
  const { user } = useUser();
  const [files, setFiles] = useState<FileWithPath[]>([]); // 썸네일
  const navigate = useNavigate();

  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodeState, edgeState, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodeState, edgeState, setEdges, setNodes],
  );

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    setGptRes(true);
    if (!user) {
      return navigate('/users/signin');
    }
    // if (!localStorage.getItem('recent_gpt_search')) {
    //   setGptRes(false);
    // }
    // if (localStorage.getItem('recent_gpt_search')) {
    // const localData: NewPrompt = JSON.parse(
    //   localStorage.getItem('recent_gpt_search'),
    // );
    //   setKeyword(localData?.keyword);
    //   axios
    //     .post(`${baseUrl}/gpt/roadmap?prompt=${localData.keyword}`, {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${user?.accessToken}`,
    //       },
    //     })
    //     .then((res) => {
    //       res?.data.length > 0 ? setGptRes(false) : setGptRes(true);
    //       setUseGpt(res?.data);
    //     })
    //     .then(() => {
    //       setGptRes(false);
    //       // onLayout('TB');
    //     });
    // }
    if (!localStorage.getItem('recent_gpt_search')) {
      setGptRes(false);
    }
    if (localStorage.getItem('recent_gpt_search')) {
      axios
        .post(
          `${baseUrl}/gpt/roadmap?prompt=${JSON.parse(
            localStorage.getItem('recent_gpt_search'),
          )?.keyword}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user?.accessToken}`,
            },
          },
        )
        .then((res) => {
          res?.data.length > 0 ? setGptRes(false) : setGptRes(true);
          setUseGpt(res?.data);
          // onLayout('TB');
        })
        // .then(() => {
        //   onLayout('TB');
        // })
        .then(() => {
          setGptRes(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onLayout('LR');
  }, [useGpt.length]);
  // const onSave = useCallback(() => { // 내부적으로 처리
  //   if (rfInstance) {
  //     const flow = rfInstance.toObject();
  //     localStorage.setItem(flowKey, JSON.stringify(flow));
  //     console.log(flow);
  //   }
  // }, [rfInstance]);

  useMemo(() => {
    const tmpNode = [];
    const tmpEdge = [];
    // console.log(useGpt);
    // eslint-disable-next-line array-callback-return
    useGpt.map((v) => {
      if (!nodeSet.has(v?.id)) {
        tmpNode.push({
          id: v?.id,
          data: {
            label: v?.content,
          },
          // type: 'default',
          type: 'custom',
          position,
          style: {
            background: '#fff',
            border: '1px solid black',
            borderRadius: 15,
            fontSize: 12,
          },
        });
        nodeSet.add(`${v?.id}`);
      }

      // source랑 target 구해서 간선id 만들고 이어주기
      // parseInt는 오로지 숫자인 부분만 parse해줬음

      if (v.id !== `${parseInt(v?.id, 10)}`) {
        if (!edgeSet.has(`e${parseInt(v?.id, 10)}${v?.id}`)) {
          tmpEdge.push({
            id: `e${parseInt(v?.id, 10)}${v?.id}`,
            source: `${parseInt(v?.id, 10)}`,
            target: v.id,
            type: edgeType,
            animated: true,
          });
        }
        edgeSet.add(`e${parseInt(v?.id, 10)}${v?.id}`);
      }
    });
    setNodes(tmpNode);
    setEdges(tmpEdge);
  }, [useGpt]);

  // useEffect(() => {
  //   // 자동 생성 후 formatting
  //   if (nodeState && edgeState && useGpt.length > 0) {
  //     onLayout('TB');
  //   }
  // }, []);

  const proOptions = { hideAttribution: true };

  // const { x, y, zoom } = useViewport();

  useMemo(() => {
    // 노드 내용 수정
    setNodes((nds) =>
      nds.map((node) => {
        // if (node.id === '1') {
        if (node.id === id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          // eslint-disable-next-line no-param-reassign
          node.data = {
            ...node.data,
            label,
          };
        }
        return node;
      }),
    );
  }, [label, id]);

  useCallback(() => {
    if (nodeState.length > 0 && edgeState.length > 0) {
      onLayout('TB');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeState, edgeState]);

  useMemo(() => {
    setNodes([...nodeState]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const onConnect = useCallback(
    // 간선 스타일 통일
    ({ source, target }) => {
      setEdges((els) => {
        return [
          ...els,
          {
            // id: `e${source}e${target}`, // 문제 : e122면 12랑 2인지 1이랑 22인지 구분이 안됨..
            id: `e${source}${target}`,
            source,
            target,
            type: edgeType,
            animated: true,
          },
        ];
      });
    },
    [setEdges],
  );

  // useMemo(() => {
  //   const { x, y } = getViewport();
  //   if (nodeState.length > 1) {
  //     setCurrentView({ x, y });
  //     alert(`${currentView.x}, ${currentView.y}`);
  //   }
  // }, [currentView, nodeState.length]);

  useMemo(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
      setStoredRoadmap(flow);
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flowStr = localStorage.getItem(flowKey);
      if (flowStr) {
        const flow = JSON.parse(flowStr);
        const {
          x = 0,
          y = 0,
          zoom = 1,
          nodes: restoredNodes,
          edges: restoredEdges,
        } = flow;
        setNodes(restoredNodes || []);
        setEdges(restoredEdges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setEdges, setViewport]);

  const onAddNode = useCallback(() => {
    const nodeCount: number = [...nodeState]?.length;
    yPos.current += 50;
    // setViewport(currentView);
    // @ts-ignore
    setNodes([
      ...nodeState,
      {
        // TODO : 노드id 는 '1a' 형식이다. 자식 노드면 '1a'지만 '1'의 형제 노드면 '2'가 된다
        // label에 들어가는 데이터가 에러를 발생시키는 걸 해결하자.
        id: (nodeCount + 1).toString(),
        data: {
          label: ``,
        },
        type: 'custom',
        // type: 'default',
        // targetPosition: Position.Top,
        // sourcePosition: Position.Bottom,
        position: { x: currentView.x, y: yPos.current },
        style: {
          background: '#fff',
          border: '1px solid black',
          borderRadius: 15,
          fontSize: 12,
        },
      },
    ]);
    nodeState.forEach((n) => {
      // console.log(n);
      // eslint-disable-next-line no-param-reassign
      n.sourcePosition = nodeState[0].sourcePosition;
      // eslint-disable-next-line no-param-reassign
      n.targetPosition = nodeState[0].targetPosition;
    });
    // console.log(state); // 노드 추가!
    setState([...state, { id: (nodeCount + 1).toString(), details: '' }]);
    setColorsState([
      ...state,
      { id: (nodeCount + 1).toString(), color: '#fff' },
    ]);
  }, [nodeState, setNodes]);

  const { postRoadmap } = useRoadmap();

  const onPublishRoadmap = useCallback(() => {
    if (edgeState.length === 0) {
      setSubmitModal(false);
      return;
    }
    const nodesCopy = [...nodeState] as RoadmapNodes;
    const edgesCopy = [...edgeState];
    // eslint-disable-next-line array-callback-return
    nodesCopy.map((v) => {
      state.map((item) => {
        if (v?.id === item?.id) {
          // eslint-disable-next-line no-param-reassign
          v.detailedContent = item?.details;
          // console.log(item?.details);
          // v.details = item?.details;
        }
        // eslint-disable-next-line no-param-reassign
        v.positionAbsolute = v.position;
      });
      // eslint-disable-next-line no-param-reassign
      v.type = 'custom';
      // v.type = 'default';
      // v.sourcePosition = currentFlow === 'LR' ? 'left' : 'top';
      // eslint-disable-next-line no-param-reassign
      v.sourcePosition = currentFlow === 'LR' ? 'bottom' : 'right';
      // eslint-disable-next-line no-param-reassign
      v.targetPosition = currentFlow === 'LR' ? 'top' : 'left';
    });

    edgesCopy.map((v) => {
      // eslint-disable-next-line no-param-reassign
      v.animated = true;
      // eslint-disable-next-line no-param-reassign
      v.type = edgeType;
    });

    const roadmapData = {
      roadmap: {
        title,
        description: desc,
        // thumbnailUrl: files,
        // thumbnailUrl: '',
        // tag: roadmapTag,
      },
      nodes: nodesCopy,
      edges: edgesCopy,
      viewport: defaultViewport,
    };

    axios
      .post(`${baseUrl}/roadmaps`, roadmapData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
      })
      .then((e) => {
        // console.log('e', e.data);
        // const blob = new Blob([JSON.stringify(data)], {
        //   type: 'multipart/form-data',
        // });

        const formData = new FormData();

        formData.append('file', files[0]);
        axios
          .post(`${baseUrl}/roadmaps/${e.data}/thumbnails`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${user?.accessToken}`,
            },
          })
          .then((v) => {
            // console.log(v);
            // eslint-disable-next-line no-alert
            alert('포스팅 성공!');

            axios
              .post(
                `${baseUrl}/roadmaps/${e.data}/join`,
                {},
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.accessToken}`,
                  },
                },
              )
              .then(() => {
                navigate(`/roadmap/post/${e.data}`);
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
    // navigate('/');
  }, [nodeState]);

  const submitBlogKeyword = useCallback(() => {
    axios
      .post(
        `${baseUrl}/roadmaps/keyword`,
        {
          roadmapNodeId: id,
          keyword: blogKeyword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`,
          },
        },
      )
      .then((v) => setKeywordSubmitState(v.data));
  }, [blogKeyword, id]);

  // const { deleteElements } = useReactFlow();
  // const useRemoveNode = useCallback(() => {
  //   setNodes((nds) => nds.filter((node) => node?.id !== label));
  // }, [label]);

  // const getGptExampleDetail = () => {
  //   setGptDisabled(true);
  //   axios
  //     .post(
  //       `${baseUrl}/gpt/detail?course=${label}`,
  //       {},
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${user?.accessToken}`,
  //         },
  //       },
  //     )
  //     .then((e) => {
  //       // console.log(e);
  //       // @ts-ignore
  //       const resDetail: string = e?.content;
  //       if (resDetail) {
  //         const resArr: Array<string | null> = resDetail.split('.');
  //         const copyState = [...state];
  //         const temp = [];
  //         copyState.map((v) => {
  //           if (v.id === id) {
  //             console.log('현재 content', v?.details);
  //             resArr.map((k) => {
  //               temp.push(`<p>${k}</p>`);
  //             });
  //             // eslint-disable-next-line no-param-reassign
  //             v.details += temp;
  //           }
  //         });
  //         console.log('현재 copyState', copyState);
  //         // setState(copyState);
  //         // setGptDisabled(false);
  //       }
  //       setGptDisabled(false);

  //       // setState(e?.content);
  //       // 상세 내용 에디터에 내용 넣어주기
  //     })
  //     .catch((err) => console.log(err));
  // };
  const getGptExampleDetail = useCallback(() => {
    setGptDisabled(true);
    axios
      .post(
        `${baseUrl}/gpt/detail?course=${label}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`,
          },
        },
      )
      .then((e) => {
        // @ts-ignore
        const resDetail: string = e?.data?.detailedContent;
        if (resDetail) {
          const copyState = [...state];
          copyState.map((v) => {
            if (v.id === id) {
              console.log('현재 content', v?.details);
              // eslint-disable-next-line no-param-reassign
              v.details += resDetail;
            }
          });
          setState(copyState);
          setGptDisabled(false);
        }
        // 상세 내용 에디터에 내용 넣어주기
      })
      .catch((err) => console.log(err));
  }, [id, state]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node?.id === id) {
          // node.style = { ...node.style, backgroundColor: nodeBg };
          // eslint-disable-next-line no-param-reassign
          node.style = {
            ...node.style,
            // backgroundColor: color,
            background: color,
          };
        }

        return node;
      }),
    );
    // };
  }, [nodeState, color, id]);

  useMemo(() => {
    if (edgeState && nodeState) {
      return;
    }
    onLayout('TB');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeState, nodeState]);

  useEffect(() => {
    // setNodes((nds) =>
    //   nds.map((node) => {
    //     if (node?.id === id) {
    //       // when you update a simple type you can just update the value
    //       // eslint-disable-next-line no-param-reassign
    //       node.hidden = nodeHidden;
    //     }
    //     return node;
    //   }),
    // );
    setNodes((nds) =>
      nds.map((node) => {
        // if (node.id === '1') {
        if (node?.id === label) {
          // when you update a simple type you can just update the value
          // eslint-disable-next-line no-param-reassign
          node.style.backgroundColor = color; // 노드 색 변경
          // eslint-disable-next-line no-param-reassign
          node.data.label = label; // 노드 내용 변경
        }
        return node;
      }),
    );
  }, [nodeState, edgeState]);

  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Image
        key={index}
        src={imageUrl}
        imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
      />
    );
  });

  // const [selectedNode, setSelectedNode] = useState([]);
  // useOnSelectionChange({
  //   onChange: ({ nodes, edges }) => {
  //     // setSelectedNode(nodes);
  //     console.log('selectedNode', selectedNode);
  //     // setNodeModal(true);
  //   },
  // });

  return (
    <Wrap>
      <LoadingOverlay visible={gptRes} />
      <Modal
        opened={submitModal}
        onClose={() => setSubmitModal(false)}
        size="40rem"
      >
        <Center>
          <h2>로드맵 정보</h2>
        </Center>
        <TextInput
          mt={50}
          placeholder="제목을 입력하세요"
          label="로드맵 이름"
          value={title}
          onChange={onChangeTitle}
          rightSection={
            !title && (
              <Tooltip label="필수 항목입니다." position="top-end" withArrow>
                <div>
                  <IconAlertCircle
                    size="1rem"
                    style={{ display: 'block', opacity: 0.5, color: 'red' }}
                  />
                </div>
              </Tooltip>
            )
          }
        />
        <Textarea
          label="로드맵 설명"
          autosize
          minRows={5}
          maxRows={10}
          mt={30}
          value={desc}
          placeholder="내용을 입력하세요"
          onChange={onChangeDesc}
          rightSection={
            !desc && (
              <Tooltip label="필수 항목입니다." position="top-end" withArrow>
                <div>
                  <IconAlertCircle
                    size="1rem"
                    style={{ display: 'block', opacity: 0.5, color: 'red' }}
                  />
                </div>
              </Tooltip>
            )
          }
        />
        <Text
          mt={30}
          style={{
            display: 'inline-flex',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <CustomLabel>로드맵 썸네일</CustomLabel>
          {!files[0]?.name && (
            <Tooltip label="필수 항목입니다." position="top-end" withArrow>
              <div>
                <IconAlertCircle
                  size="1rem"
                  style={{
                    display: 'inline-block',
                    opacity: 0.5,
                    color: 'red',
                  }}
                />
              </div>
            </Tooltip>
          )}
        </Text>
        <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles}>
          <Text align="center">썸네일 등록 </Text>
        </Dropzone>
        <SimpleGrid
          cols={4}
          breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
          mt={previews.length > 0 ? 'xl' : 0}
        >
          {previews}
        </SimpleGrid>
        <Center>
          <Button
            mt={30}
            onClick={() => {
              setEdges(edgeState);
              setNodes(nodeState);
              onPublishRoadmap();
            }}
          >
            작성하기
          </Button>
        </Center>
      </Modal>
      <Modal
        opened={confirmDelete}
        size="70%"
        onClose={() => setConfirmDelete(false)}
      >
        <Center>
          <Center>
            <h1>정말로 모든 노드를 지우겠습니까?</h1>
            <h3>모두 지우기를 누를 시 작업 내용을 복구할 수 없습니다.</h3>
          </Center>
          <div className="confirm_btn_wrap">
            <Button
              mt={30}
              onClick={() => {
                // setNodes([]);
                setNodes(initialNodes);
                setEdges([]);
                setConfirmDelete(false);
              }}
            >
              모두 지우기
            </Button>
            <Button
              mt={30}
              variant="outline"
              onClick={() => setConfirmDelete(false)}
            >
              취소
            </Button>
          </div>
        </Center>
      </Modal>
      <Panel position="top-center">
        <Modal opened={nodeModal} onClose={() => setNodeModal(false)} size="xl">
          <Wrap>
            <Center>
              <h1>상세내용</h1>
            </Center>

            <Popover
              width={200}
              position="top"
              withArrow
              shadow="md"
              opened={opened}
            >
              <div>
                <Popover.Target>
                  <ActionIcon
                    mt={10}
                    onMouseEnter={open}
                    onMouseLeave={close}
                    mb={10}
                    variant="outline"
                    onClick={() => {
                      setLabel(label);
                      // console.log(label);
                      getGptExampleDetail();
                    }}
                    loading={gptDisabled}
                  >
                    <IconWand size="1rem" />
                  </ActionIcon>
                </Popover.Target>
              </div>
              <Popover.Dropdown
                sx={{
                  pointerEvents: 'none',
                  backgroundColor: '#ebf6fc',
                }}
                style={{ zIndex: '700' }}
              >
                <Text size="sm">ChatGpt로 자동 생성하기</Text>
              </Popover.Dropdown>
            </Popover>

            <Input
              // icon={<IconAt />}
              value={label}
              mt={10}
              mb={10}
              // onChange={onChangeLabel}
              onChange={(evt) => {
                setLabel(evt?.target?.value);
              }}
              placeholder="내용을 입력해주세요."
            />
            <ColorInput
              value={color}
              mt={10}
              mb={20}
              onChange={(evt) => {
                setColor(evt);
              }}
              placeholder="Pick color"
              label="노드의 배경색을 골라주세요."
            />
            <Input.Wrapper label="블로그 인증 키워드 등록">
              <Input
                icon={<IconCertificate />}
                value={blogKeyword}
                onChange={onChangeBlogKeyword}
                mt={10}
                mb={10}
                disabled={keywordSubmitState}
                rightSection={
                  <Tooltip
                    label="진행도를 체크할 블로그 키워드를 등록해주세요. 키워드 수정은 불가능합니다."
                    position="top-end"
                    withArrow
                  >
                    <ActionIcon
                      disabled={blogKeyword.length === 0}
                      variant="transparent"
                      onClick={() => {
                        setBlogKeyword(blogKeyword);
                        submitBlogKeyword();
                      }}
                    >
                      <IconCircleArrowRightFilled size="1rem" />
                    </ActionIcon>
                  </Tooltip>
                }
                // onChange={(evt) => {
                //   setLabel(evt?.target?.value);
                // }}
                placeholder="블로그 키워드를 입력해주세요."
              />
            </Input.Wrapper>
            {/* <input
              // value={selectedNode[0]?.style.background}
              onChange={(evt) => {
                // eslint-disable-next-line no-param-reassign
                // selectedNode[0].style.background = evt.target.value;
              }}
            />
             */}
            {/* <input
              value={selectedNode[0]?.data.label}
              onChange={(evt) => {
                selectedNode[0].data.label = evt.target.value;
              }}
            />
            <input
              value={selectedNode[0]?.data.label}
              onChange={(evt) => {
                selectedNode[0].data.label = evt.target.value;
              }}
            /> */}
            <CustomLabel>로드맵 상세 내용</CustomLabel>
            {toggleEditor}
          </Wrap>

          {/* {selectedNode[0]?.id === id && toggleEditor} */}

          {/* <div className="confirm_btn_wrap">
            <Button
              mt={10}
              onClick={() => {
                setNodeModal(false);
              }}
            >
              닫기
            </Button>
          </div> */}
        </Modal>
      </Panel>
      <ReactFlow
        nodes={nodeState}
        edges={edgeState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultViewport={defaultViewport}
        minZoom={0.2}
        maxZoom={4}
        // onInit={onInit}
        onConnect={onConnect}
        onNodeClick={(e, n) => {
          setLabel(`${n?.data?.label}`);
          setId(n?.id);
          setColor(n?.style?.background);

          // setSelectedNode(n);
          console.log('n', n);
          console.log('e', e);
          setNodeModal(true);
          // console.log('selectedNode', selectedNode);
        }}
        attributionPosition="bottom-left"
        fitView
        zoomOnDoubleClick
        elevateNodesOnSelect
        snapToGrid
        proOptions={proOptions}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ebf6fc',
          opacity: '80%',
        }}
      >
        <Panel position="top-right">
          {currentFlow === 'LR' ? (
            <Button
              type="button"
              onClick={() => {
                onLayout('TB');
                setCurrentFlow('TB');
              }}
              mr={10}
            >
              vertical layout
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                onLayout('LR');
                setCurrentFlow('LR');
              }}
              mr={10}
            >
              horizontal layout
            </Button>
          )}
          <Button
            type="button"
            onClick={() => {
              const { x, y, zoom } = getViewport();
              setCurrentView({
                x: currentView.x,
                y: nodeState.at(-1)?.position?.y,
                zoom,
              });
              console.log(nodeState.at(-1)?.position);
              onAddNode();
            }}
            mr={10}
          >
            노드 추가
          </Button>
          {nodeState.length === 0 ? (
            <Button
              type="button"
              data-disabled
              sx={{
                '&[data-disabled]': { opacity: 0.8, pointerEvents: 'all' },
              }}
              onClick={() => setConfirmDelete(true)}
              mr={10}
            >
              노드 전체 삭제
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setConfirmDelete(true)}
              mr={10}
            >
              노드 전체 삭제
            </Button>
          )}
          {/* <Button type="button" onClick={onRestore} mr={10}>
            restore
          </Button> */}
          <Button
            type="button"
            onClick={() => {
              // onSave();
              // open();
              setSubmitModal(true);
            }}
            mr={10}
            mt={10}
          >
            로드맵 발행
          </Button>
        </Panel>
        <Background gap={16} />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </Wrap>
  );
}
const CustomLabel = styled.div`
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #212529;
  word-break: break-word;
  cursor: default;
`;
const Wrap = styled.div`
  width: 100%;
  height: 93.2vh;
  & .updatenode__controls {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 4;
    font-size: 12px;
  }

  & .updatenode__controls label {
    display: block;
  }

  & .updatenode__bglabel {
    margin-top: 10px;
  }

  & .updatenode__checkboxwrapper {
    margin-top: 10px;
    display: flex;
    align-items: center;
  }

  & .confirm_btn_wrap {
    display: inline-flex;
    width: 100%;
  }
`;
export default function RoadMapCanvas({
  editor,
  label,
  roadMapTitle,
  roadmapImage,
  toggleEditor,
  roadmapDescription,
  roadmapTag,
  setLabel,
  blogKeyword,
  onChangeBlogKeyword,
  setBlogKeyword,
  onRoadMapTitleChange,
  setRoadMapTitle,
  id,
  onChangeLabel,
  setState,
  state,
  onChangeId,
  setId,
  color,
  onChangeColor,
  setColor,
  colorsState,
  setColorsState,
  // selectedNode,
  // setSelectedNode,
}) {
  return (
    <ReactFlowProvider>
      <Roadmap
        editor={editor}
        colorsState={colorsState}
        setColorsState={setColorsState}
        setState={setState}
        label={label}
        color={color}
        onChangeColor={onChangeColor}
        setColor={setColor}
        // selectedNode={selectedNode}
        // setSelectedNode={setSelectedNode}
        roadMapTitle={roadMapTitle}
        roadmapImage={roadmapImage}
        toggleEditor={toggleEditor}
        roadmapDescription={roadmapDescription}
        onRoadMapTitleChange={onRoadMapTitleChange}
        roadmapTag={roadmapTag}
        setRoadMapTitle={setRoadMapTitle}
        setLabel={setLabel}
        blogKeyword={blogKeyword}
        onChangeBlogKeyword={onChangeBlogKeyword}
        setBlogKeyword={setBlogKeyword}
        state={state}
        onChangeId={onChangeId}
        onChangeLabel={onChangeLabel}
        id={id}
        setId={setId}
      />
    </ReactFlowProvider>
  );
}
