// import 'reactflow/dist/style.css';

// import dagre from '@dagrejs/dagre';
// import {
//   Button,
//   Center,
//   Image,
//   LoadingOverlay,
//   Modal,
//   MultiSelect,
//   SimpleGrid,
//   Text,
//   Textarea,
//   TextInput,
// } from '@mantine/core';
// // import { useRoadmap } from 'components/roadmaps/hooks/useRoadmap'; // origin : initialMerge
// import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
// import { useDisclosure } from '@mantine/hooks';
// import { useRoadmap } from 'components/roadmaps/posts/hooks/useRoadmap';
// import { useUser } from 'components/user/hooks/useUser';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import ReactFlow, {
//   addEdge,
//   Background,
//   Controls,
//   MiniMap,
//   Panel,
//   Position,
//   ReactFlowProvider,
//   useEdgesState,
//   useNodesState,
//   useOnSelectionChange,
//   useReactFlow,
// } from 'reactflow';
// import { getStoredRoadmap, setStoredRoadmap } from 'storage/roadmap-storage';
// import { styled } from 'styled-components';

// import { useInput } from '../common/hooks/useInput';
// import CustomNode from './custom/CustomNode';
// // eslint-disable-next-line import/no-named-as-default
// import TooltipNode from './custom/TooltipNode';

// const dagreGraph = new dagre.graphlib.Graph();
// dagreGraph.setDefaultEdgeLabel(() => ({}));

// const nodeWidth = 172;
// const nodeHeight = 36;

// const flowKey = 'example-flow';

// const getLayoutedElements = (nodes, edges, direction = 'TB') => {
//   const isHorizontal = direction === 'LR';
//   dagreGraph.setGraph({ rankdir: direction });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node?.id, { width: nodeWidth, height: nodeHeight });
//   });

//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge?.source, edge?.target);
//   });

//   dagre.layout(dagreGraph);

//   nodes.forEach((node) => {
//     const nodeWithPosition = dagreGraph.node(node?.id);
//     // eslint-disable-next-line no-param-reassign
//     node.targetPosition = isHorizontal ? 'left' : 'top';
//     // eslint-disable-next-line no-param-reassign
//     node.sourcePosition = isHorizontal ? 'right' : 'bottom';
//     // We are shifting the dagre node position (anchor=center center) to the top left
//     // so it matches the React Flow node anchor point (top left).
//     // eslint-disable-next-line no-param-reassign
//     node.position = {
//       x: nodeWithPosition.x - nodeWidth / 2,
//       y: nodeWithPosition.y - nodeHeight / 2,
//     };
//     return node;
//   });

//   return { nodes, edges };
// };

// const position = { x: 0, y: 0 };
// const edgeType = 'smoothstep';
// // const nodeTypes = {
// //   ResizableNodeSelected,
// //   custom: CustomNode,
// // };
// const nodeTypes = {
//   custom: CustomNode,
//   tooltip: TooltipNode,
// };

// const initialNodes = [
//   {
//     id: '1',
//     data: {
//       label: 'test',
//       toolbarPosition: Position.Right,
//       // currentFlow,
//     },
//     position: { x: 100, y: 100 },
//     // type: 'default',
//     // type: { nodeTypes },
//     type: 'custom',
//     style: {
//       background: '#fff',
//       border: '1px solid black',
//       borderRadius: 15,
//       fontSize: 12,
//     },
//   },
//   {
//     id: '2',
//     data: {
//       label: 'Node 2',
//       toolbarPosition: Position.Top,
//     },
//     position: { x: 100, y: 200 },
//     // type: 'default',
//     // type: { nodeTypes },
//     // type: 'tooltip',
//     type: 'custom',
//     style: {
//       background: '#fff',
//       border: '1px solid black',
//       borderRadius: 15,
//       fontSize: 12,
//     },
//   },
// ];

// const initialEdges = [
//   { id: 'e11a', source: '1', target: '1a', type: edgeType, animated: true },
// ];
// const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

// function Roadmap({
//   editor,
//   label,
//   roadMapTitle,
//   roadmapImage,
//   roadmapDescription,
//   roadmapTag,
//   onRoadMapTitleChange,
//   setRoadMapTitle,
//   setLabel,
//   toggleEditor,
//   onChangeLabel,
//   id,
//   setState,
//   state,
//   onChangeId,
//   setId,
// }) {
//   const [currentFlow, setCurrentFlow] = useState('');
//   // const initialNodes = [
//   //   {
//   //     id: '1',
//   //     data: {
//   //       label: 'test',
//   //       toolbarPosition: Position.Right,
//   //       currentFlow,
//   //       getLayoutedElements,
//   //     },
//   //     position: { x: 100, y: 100 },
//   //     type: 'default',
//   //     // type: { nodeTypes },
//   //     // type: 'custom',
//   //     style: {
//   //       background: '#fff',
//   //       border: '1px solid black',
//   //       borderRadius: 15,
//   //       fontSize: 12,
//   //     },
//   //   },
//   //   {
//   //     id: '2',
//   //     data: {
//   //       label: 'Node 2',
//   //       toolbarPosition: Position.Top,
//   //       currentFlow,
//   //     },
//   //     position: { x: 100, y: 200 },
//   //     type: 'default',
//   //     // type: { nodeTypes },
//   //     // type: 'tooltip',
//   //     // type: 'custom',
//   //     style: {
//   //       background: '#fff',
//   //       border: '1px solid black',
//   //       borderRadius: 15,
//   //       fontSize: 12,
//   //     },
//   //   },
//   // ];

//   // const initialEdges = [
//   //   { id: 'e11a', source: '1', target: '1a', type: edgeType, animated: true },
//   // ];
//   // const { prompt } = usePromptAnswer();

//   const [search] = useSearchParams();
//   // const edgeSet = new Set<RoadmapEdge['id']>(); // tsx
//   const edgeSet = new Set();
//   // const edgeSet = new Set<RoadmapNode['id']>(); // tsx
//   const nodeSet = new Set();
//   const [isLoading, setIsLoading] = useState(true);
//   const [nodeState, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edgeState, setEdges, onEdgesChange] = useEdgesState(initialEdges);
//   const [title, onChangeTitle, setTitle] = useInput('');
//   const [desc, onChangeDesc, setDesc] = useInput('');
//   const [gptRes, setGptRes] = useState([]);
//   const [confirmDelete, setConfirmDelete] = useState(false);

//   const [nodeBg, setNodeBg] = useState('#eee');
//   const [nodeHidden, setNodeHidden] = useState(false);
//   const [rfInstance, setRfInstance] = useState(null);
//   const { setViewport } = useReactFlow();
//   const [useGpt, setUseGpt] = useState(false);
//   const [opened, { open, close }] = useDisclosure(false);
//   const [nodeModal, setNodeModal] = useState(false);

//   const [selectedData, setSelectedData] = useState([
//     { value: 'react', label: 'React' },
//     { value: 'ng', label: 'Angular' },
//   ]);
//   const { user } = useUser();
//   // const [files, setFiles] = useState<FileWithPath[]>([]); // tsx
//   const [files, setFiles] = useState([]);
//   const navigate = useNavigate();
//   // eslint-disable-next-line consistent-return
//   useEffect(() => {
//     if (!user) {
//       return navigate('/users/signin');
//     }
//     // const getRecentGpt = localStorage.getItem('recent_gpt_search');
//     // console.log(getRecentGpt);

//     // axios.post(`${baseUrl}/chat?prompt=${}`,{ headers: {
//   }, []);

//   // useEffect(()=>{

//   // },[])

//   const proOptions = { hideAttribution: true };

//   // const { x, y, zoom } = useViewport();

//   // useEffect(() => {
//   //   console.log(x, y, zoom);
//   // }, [x, y, zoom]);
//   // useEffect(() => {
//   //   if (search.size > 0 && gptRes.length === 0) {
//       // axios
//       //   .post(`${baseUrl}/chat?prompt=${search.get('title')}`, {
//       //     headers: {
//       //       'Content-Type': 'application/json',
//       //       Authorization: `Bearer ${user?.accessToken}`,
//       //     },
//       //   })
//       //   .then((res) => {
//       //     // setGptRes(res?.data);
//       //     // const { data } = prompt;
//       //     // const dataCopy = [...data];
//       //     // console.log(dataCopy);
//       //     // console.log('res.data', res.data);

//       //     // eslint-disable-next-line array-callback-return
//       //   });
//   //   }
//   // }, []);
//   // if (getStoredRoadmap()) {
//   // const { edges, nodes, viewport } = getStoredRoadmap();
//   // setNodes(nodes);
//   //   setEdges(edges);
//   //   setViewport(viewport);

//   //   return;
//   // }
//   // console.log(search.get('title'));

//   //     if (prompt && search.size > 0 && prompt.keyword === search.get('title')) {
//   //       // if (useGpt && search.size > 0) {
//   //       // gpt 자동생성

//   //       const { data } = prompt;
//   //       const dataCopy = [...data];
//   //       // console.log(dataCopy);

//   //       // eslint-disable-next-line array-callback-return
//   //       dataCopy.map((v) => {
//   //         if (!nodeSet.has(v?.id)) {
//   //           initialNodes.push({
//   //             id: v?.id,
//   //             data: {
//   //               label: v?.content,
//   //             },
//   //             type: 'default',
//   //             position,
//   //             style: {
//   //               background: '#fff',
//   //               border: '1px solid black',
//   //               borderRadius: 15,
//   //               fontSize: 12,
//   //             },
//   //           });
//   //           nodeSet.add(`${v?.id}`);
//   //         }

//   //         // source랑 target 구해서 간선id 만들고 이어주기
//   //         // parseInt는 오로지 숫자인 부분만 parse해줬음

//   //         if (v.id !== `${parseInt(v?.id, 10)}`) {
//   //           if (!edgeSet.has(`e${parseInt(v?.id, 10)}${v?.id}`)) {
//   //             initialEdges.push({
//   //               id: `e${parseInt(v?.id, 10)}${v?.id}`,
//   //               source: `${parseInt(v?.id, 10)}`,
//   //               target: v.id,
//   //               type: edgeType,
//   //               animated: true,
//   //             });
//   //           }
//   //           edgeSet.add(`e${parseInt(v?.id, 10)}${v?.id}`);
//   //         }
//   //       });
//   //       setNodes(initialNodes);
//   //       setEdges(initialEdges);
//   //       // search.size !== 0 ? setNodes(initialNodes) : setNodes([]);
//   //       // search.size !== 0 ? setEdges(initialEdges) : setEdges([]);
//   //       if (search.size !== 0) {
//   //         // onLayout('TB');
//   //         onLayout('LR');
//   //       }
//   // >>>>>>> initialmerge

//   // useEffect(() => {
//   //   // console.log(gptRes);

//   // }, []);
//   // gptRes.map((v) => {
//   //   if (!nodeSet.has(v?.id)) {
//   //     initialNodes.push({
//   //       id: v?.id,
//   //       data: {
//   //         label: v?.content,
//   //       },
//   //       type: 'default',
//   //       position,
//   //       style: {
//   //         background: '#fff',
//   //         border: '1px solid black',
//   //         borderRadius: 15,
//   //         fontSize: 12,
//   //       },
//   //     });
//   //     nodeSet.add(`${v?.id}`);
//   //   }

//   //   // source랑 target 구해서 간선id 만들고 이어주기
//   //   // parseInt는 오로지 숫자인 부분만 parse해줬음

//   //   if (v.id !== `${parseInt(v?.id, 10)}`) {
//   //     if (!edgeSet.has(`e${parseInt(v?.id, 10)}${v?.id}`)) {
//   //       initialEdges.push({
//   //         id: `e${parseInt(v?.id, 10)}${v?.id}`,
//   //         source: `${parseInt(v?.id, 10)}`,
//   //         target: v.id,
//   //         type: edgeType,
//   //         animated: true,
//   //       });
//   //     }
//   //     edgeSet.add(`e${parseInt(v?.id, 10)}${v?.id}`);
//   //   }
//   // });
//   // setNodes(initialNodes);
//   // setEdges(initialEdges);
//   // if (search.size !== 0) {
//   //   // onLayout('TB');
//   //   onLayout('LR');
//   // }
//   // }, [gptRes]);

//   useMemo(() => {
//     // 노드 내용 수정
//     setNodes((nds) =>
//       nds.map((node) => {
//         // if (node.id === '1') {
//         if (node.id === id) {
//           // it's important that you create a new object here
//           // in order to notify react flow about the change
//           // eslint-disable-next-line no-param-reassign
//           node.data = {
//             ...node.data,
//             label,
//           };
//         }

//         return node;
//       }),
//     );
//   }, [label, id]);
//   // }, [label, id]);
//   // useMemo(() => {
//   //   setNodes((nds) =>
//   //     nds.map((node) => {
//   //       // if (node.id === '1') {
//   //       if (node.id === id) {
//   //         // it's important that you create a new object here
//   //         // in order to notify react flow about the change
//   //         // eslint-disable-next-line no-param-reassign
//   //         node.data = {
//   //           ...node.data,
//   //           label: nodeName,
//   //         };
//   //       }
//   //       console.log(node);

//   //       return node;
//   //     }),
//   //   );
//   // }, [label, nodeName]);

//   useMemo(() => {
//     // console.log('roadmapeditor props', editor);
//     setNodes([...nodeState]);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [editor]);

//   const onConnect = useCallback(
//     (params) => {
//       setEdges((els) => addEdge(params, els));
//     },
//     [setEdges],
//   );

//   // const onSave = useCallback(() => {
//   //   if (rfInstance) {
//   //     const flow = rfInstance.toObject();
//   //     localStorage.setItem(flowKey, JSON.stringify(flow));
//   //     console.log(flow);
//   //   }
//   // }, [rfInstance]);

//   // useCallback(() => {
//   useMemo(() => {
//     if (rfInstance) {
//       const flow = rfInstance.toObject();
//       localStorage.setItem(flowKey, JSON.stringify(flow));
//       setStoredRoadmap(flow);
//     }
//   }, [rfInstance]);

//   const onRestore = useCallback(() => {
//     const restoreFlow = async () => {
//       const flowStr = localStorage.getItem(flowKey);
//       if (flowStr) {
//         const flow = JSON.parse(flowStr);
//         const {
//           x = 0,
//           y = 0,
//           zoom = 1,
//           nodes: restoredNodes,
//           edges: restoredEdges,
//         } = flow;
//         setNodes(restoredNodes || []);
//         setEdges(restoredEdges || []);
//         setViewport({ x, y, zoom });
//         // console.log(flowStr);
//       }
//     };

//     restoreFlow();
//     // roadmap.getRoadmap(title, desc, flowKey);
//   }, [setNodes, setEdges, setViewport]);
//   // const onClickItem = useCallback((e) => {
//   //   console.log(e);
//   // }, []);

//   // const onLayout = useCallback(
//   //   (direction) => {
//   //     const { nodes: layoutedNodes, edges: layoutedEdges } =
//   //       getLayoutedElements(nodes, edges, direction);

//   //     setNodes([...layoutedNodes]);
//   //     setEdges([...layoutedEdges]);
//   //   },
//   //   [nodes, edges, setEdges, setNodes],
//   // );

//   const onLayout = useCallback(
//     (direction) => {
//       const { nodes: layoutedNodes, edges: layoutedEdges } =
//         getLayoutedElements(nodeState, edgeState, direction);

//       setNodes([...layoutedNodes]);
//       setEdges([...layoutedEdges]);
//     },
//     [nodeState, edgeState, setEdges, setNodes],
//   );

//   const onAddNode = useCallback(() => {
//     // const nodeCount: number = [...nodeState]?.length; // tsx
//     const nodeCount = [...nodeState]?.length;
//     setNodes([
//       ...nodeState,
//       {
//         // TODO : 노드id 는 '1a' 형식이다. 자식 노드면 '1a'지만 '1'의 형제 노드면 '2'가 된다
//         // label에 들어가는 데이터가 에러를 발생시키는 걸 해결하자.
//         id: (nodeCount + 1).toString(),
//         data: {
//           label: ``,
//           toolbarPosition: Position.Top,
//           currentFlow,
//         },
//         type: 'default',
//         // type: 'ResizableNodeSelected',
//         // type: { nodeTypes },
//         // type: 'tooltip',
//         // type: 'custom',
//         position,
//         // position: { x, y },
//         style: {
//           background: '#fff',
//           border: '1px solid black',
//           borderRadius: 15,
//           fontSize: 12,
//         },
//       },
//     ]);
//   }, [nodeState, setNodes]);

//   const { postRoadmap } = useRoadmap();

//   const onPublishRoadmap = useCallback(() => {
//     const { edges, nodes, viewport } = getStoredRoadmap();
//     console.log('nodes', nodes);
//     const nodesCopy = [...nodes];
//     const edgesCopy = [...edges];
//     nodesCopy.map((v) => {
//       state.map((item) => {
//         if (v?.id === item?.id) {
//           // console.log('onPublish', item.details);
//           // eslint-disable-next-line no-param-reassign
//           v.detailedContent = item?.details;
//           // eslint-disable-next-line no-param-reassign
//           // v.targetPosition = item.targetPosition;
//           // // eslint-disable-next-line no-param-reassign
//           // v.sourcePosition = item.sourcePosition;
//         }
//       });
//     });
//     edgesCopy.map((v) => {
//       // eslint-disable-next-line no-param-reassign
//       v.animated = true;
//       // eslint-disable-next-line no-param-reassign
//       v.type = edgeType;
//     });

//     const data = {
//       roadmap: {
//         title: roadMapTitle,
//         description: desc,
//         thumbnailUrl: '',
//         tag: roadmapTag,
//       },
//       nodes: nodesCopy,
//       edges: edgesCopy,
//       viewport: defaultViewport,
//     };
//     postRoadmap(data);
//     // navigate('/');
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [nodeState]);

//   // const { deleteElements } = useReactFlow();
//   const useRemoveNode = useCallback(() => {
//     setNodes((nds) => nds.filter((node) => node?.id !== label));
//   }, [label]);

//   useEffect(() => {
//     setNodes((nds) =>
//       nds.map((node) => {
//         if (node?.id === id) {
//           // eslint-disable-next-line no-param-reassign
//           node.style = { ...node.style, backgroundColor: nodeBg };
//         }

//         return node;
//       }),
//     );
//     // };
//   }, [nodeState, nodeBg, id]);

//   useMemo(() => {
//     if (edgeState && nodeState) {
//       return;
//     }
//     onLayout('TB');

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [edgeState, nodeState]);

//   useEffect(() => {
//     setNodes((nds) =>
//       nds.map((node) => {
//         if (node?.id === id) {
//           // when you update a simple type you can just update the value
//           // eslint-disable-next-line no-param-reassign
//           node.hidden = nodeHidden;
//         }
//         return node;
//       }),
//     );
//     setNodes((nds) =>
//       nds.map((node) => {
//         // if (node.id === '1') {
//         if (node?.id === label) {
//           // when you update a simple type you can just update the value
//           // eslint-disable-next-line no-param-reassign
//           node.data.label = label;
//           // console.log(node.data.label);
//         }
//         return node;
//       }),
//     );
//   }, [nodeState, edgeState]);
//   // }, [nodeState, edgeState, setNodes, id, nodeHidden, label]);
//   // setEdges((eds) =>
//   //   eds.map((edge) => {
//   //     // if (edge.id === 'e1-2') {
//   //     if (edge.id === 'e11a') {
//   //       // console.log(edge);
//   //       // if (parseInt(edge.id, 10) === label) {
//   //       // eslint-disable-next-line no-param-reassign
//   //       edge.hidden = nodeHidden;
//   //     }

//   //     return edge;
//   //   }),
//   // );

//   const previews = files.map((file, index) => {
//     const imageUrl = URL.createObjectURL(file);
//     return (
//       <Image
//         key={index}
//         src={imageUrl}
//         imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
//       />
//     );
//   });

//   // search.size >0 && return (<Loading/>);
//   // eslint-disable-next-line consistent-return
//   useMemo(() => {
//     // useEffect(() => {
//     if (search.size > 0) {
//       return <LoadingOverlay visible />;
//     }
//     if (gptRes.length > 0) {
//       gptRes.map((v) => {
//         if (!nodeSet.has(v?.id)) {
//           initialNodes.push({
//             id: v?.id,
//             data: {
//               label: v?.content,
//               toolbarPosition: Position.Left,
//             },
//             type: 'default',
//             // type: 'ResizableNodeSelected',
//             // type: { nodeTypes },
//             // type: 'tooltip',
//             position,
//             style: {
//               background: '#fff',
//               border: '1px solid black',
//               borderRadius: 15,
//               fontSize: 12,
//             },
//           });
//           nodeSet.add(`${v?.id}`);
//         }

//         // source랑 target 구해서 간선id 만들고 이어주기
//         // parseInt는 오로지 숫자인 부분만 parse해줬음

//         if (v?.id !== `${parseInt(v?.id, 10)}`) {
//           if (!edgeSet.has(`e${parseInt(v?.id, 10)}${v?.id}`)) {
//             initialEdges.push({
//               id: `e${parseInt(v?.id, 10)}${v?.id}`,
//               source: `${parseInt(v?.id, 10)}`,
//               target: v.id,
//               type: edgeType,
//               animated: true,
//             });
//           }
//           edgeSet.add(`e${parseInt(v?.id, 10)}${v?.id}`);
//         }
//       });
//       setNodes(initialNodes);
//       setEdges(initialEdges);
//       if (search.size !== 0) {
//         // onLayout('TB');
//         onLayout('LR');
//       }
//     }
//   }, [gptRes]);

//   useMemo(() => {
//     console.log(currentFlow);
//   }, [currentFlow]);
//   const [selectedNode, setSelectedNode] = useState([]);
//   useOnSelectionChange({
//     onChange: ({ nodes, edges }) => {
//       // console.log('changed selection', nodes);
//       setSelectedNode(nodes);
//       // if (nodes.length > 0) {
//       setNodeModal(true);
//       // }
//     },
//     // console.log('changed selection', nodes, edges),
//     // console.log('changed selection', edges),
//   });

//   return (
//     <Wrap>
//       <Modal opened={opened} onClose={close} size="40rem">
//         <Center>
//           <h2>로드맵 정보</h2>
//         </Center>
//         <TextInput
//           mt={50}
//           placeholder="제목을 입력하세요"
//           label="로드맵 이름"
//           value={title}
//           onChange={onChangeTitle}
//         />
//         {/* <Group position="apart" mt={20}>
//           <TextInput
//             placeholder="기간을 입력하세요"
//             label="권장 수행기간"
//             w={200}
//           />
//           <Select
//             label="난이도 설정"
//             placeholder="입문"
//             data={[
//               { value: '1', label: '입문' },
//               { value: '2', label: '초급' },
//               { value: '3', label: '중급 이상' },
//             ]}
//             w={200}
//           />
//         </Group> */}
//         <MultiSelect
//           label="로드맵 태그 설정"
//           mt={20}
//           data={selectedData}
//           placeholder="태그를 선택해주세요"
//           searchable
//           creatable
//           getCreateLabel={(query) => `+ Create ${query}`}
//           onCreate={(query) => {
//             const item = { value: query, label: query };
//             setSelectedData((current) => [...current, item]);
//             return item;
//           }}
//         />
//         <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles} mt={30}>
//           <Text align="center">Drop images here</Text>
//         </Dropzone>
//         <SimpleGrid
//           cols={4}
//           breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
//           mt={previews.length > 0 ? 'xl' : 0}
//         >
//           {previews}
//         </SimpleGrid>
//         <Textarea
//           label="로드맵 설명"
//           autosize
//           minRows={5}
//           maxRows={10}
//           mt={30}
//           value={desc}
//           placeholder="내용을 입력하세요"
//           onChange={onChangeDesc}
//         />
//         <Center>
//           <Button
//             mt={30}
//             onClick={() => {
//               onPublishRoadmap();
//             }}
//           >
//             작성하기
//           </Button>
//         </Center>
//       </Modal>
//       <Modal
//         opened={confirmDelete}
//         size="70%"
//         onClose={() => setConfirmDelete(false)}
//       >
//         <Center>
//           <Center>
//             <h1>정말로 모든 노드를 지우겠습니까?</h1>
//             <h3>모두 지우기를 누를 시 작업 내용을 복구할 수 없습니다.</h3>
//           </Center>
//           <div className="confirm_btn_wrap">
//             <Button
//               onClick={() => {
//                 // setNodes([]);
//                 setNodes(initialNodes);
//                 setEdges([]);
//                 setConfirmDelete(false);
//               }}
//             >
//               모두 지우기
//             </Button>
//             <Button variant="outline" onClick={() => setConfirmDelete(false)}>
//               취소
//             </Button>
//           </div>
//         </Center>
//       </Modal>
//       <Panel position="top-center">
//         <Modal opened={nodeModal} onClose={() => setNodeModal(false)} size="xl">
//           <div>
//             <Center>
//               <h1>nodes</h1>
//               {JSON.stringify(selectedNode[0])}
//               <input
//                 value={label}
//                 onChange={(evt) => {
//                   setLabel(evt.target.value);
//                 }}
//               />
//             </Center>
//           </div>

//           {selectedNode[0]?.id && toggleEditor}

//           <div className="confirm_btn_wrap">
//             <Button onClick={() => setNodeModal(false)}>닫기</Button>
//           </div>
//         </Modal>
//       </Panel>
//       {isLoading ? (
//         <LoadingOverlay />
//       ) : (
//         <ReactFlow
//           nodes={nodeState}
//           defaultNodes={initialNodes}
//           defaultEdges={initialEdges}
//           edges={edgeState}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           defaultViewport={defaultViewport}
//           minZoom={0.2}
//           maxZoom={4}
//           onConnect={onConnect}
//           onNodeClick={(e, n) => {
//             setLabel(`${n?.data?.label}`);
//             setId(`${n?.id}`);
//           }}
//           attributionPosition="bottom-left"
//           fitView
//           zoomOnDoubleClick
//           elevateNodesOnSelect
//           snapToGrid
//           proOptions={proOptions}
//           onInit={setRfInstance}
//           nodeTypes={nodeTypes}
//           style={{
//             width: '100%',
//             height: '100%',
//             backgroundColor: '#ebf6fc',
//             opacity: '80%',
//           }}
//         >
//           {/* <Panel position="top-right">
//           <div className="updatenode__controls">
//             <input
//               value={label}
//               onChange={(evt) => {
//                 setLabel(evt.target.value);
//               }}
//             />
//             <ActionIcon color="blue">
//               <IconPencil size="1.2rem" />
//             </ActionIcon>
//             <div className="updatenode__bglabel">background:</div>
//             <input
//               value={nodeBg}
//               onChange={(evt) => setNodeBg(evt.target.value)}
//             />

//             <div className="updatenode__checkboxwrapper">
//               <div>hidden:</div>
//               <input
//                 type="checkbox"
//                 checked={nodeHidden}
//                 onChange={(evt) => setNodeHidden(evt.target.checked)}
//               />
//             </div>
//           </div>
//         </Panel> */}
//           <Panel position="top-right">
//             {currentFlow === 'TB' ? (
//               <Button
//                 type="button"
//                 onClick={() => {
//                   onLayout('LR');
//                   setCurrentFlow('LR');
//                 }}
//                 mr={10}
//               >
//                 horizontal layout
//               </Button>
//             ) : (
//               <Button
//                 type="button"
//                 onClick={() => {
//                   onLayout('TB');
//                   setCurrentFlow('TB');
//                 }}
//                 mr={10}
//               >
//                 vertical layout
//               </Button>
//             )}

//             <Button type="button" onClick={() => onAddNode()} mr={10}>
//               노드 추가
//             </Button>
//             {nodeState.length === 0 ? (
//               <Button
//                 type="button"
//                 data-disabled
//                 sx={{
//                   '&[data-disabled]': { opacity: 0.8, pointerEvents: 'all' },
//                 }}
//                 onClick={() => setConfirmDelete(true)}
//                 mr={10}
//               >
//                 노드 전체 삭제
//               </Button>
//             ) : (
//               <Button
//                 type="button"
//                 onClick={() => setConfirmDelete(true)}
//                 mr={10}
//               >
//                 노드 전체 삭제
//               </Button>
//             )}
//             <Button type="button" onClick={onRestore} mr={10}>
//               restore
//             </Button>
//             <Button type="button" onClick={open} mr={10} mt={10}>
//               로드맵 발행
//             </Button>
//           </Panel>
//           <Background gap={16} />
//           <Controls />
//           <MiniMap zoomable pannable />
//         </ReactFlow>
//       )}
//     </Wrap>
//   );
// }
// const Wrap = styled.div`
//   width: 100%;
//   height: 90vh;
//   & .updatenode__controls {
//     position: absolute;
//     right: 10px;
//     top: 10px;
//     z-index: 4;
//     font-size: 12px;
//   }

//   & .updatenode__controls label {
//     display: block;
//   }

//   & .updatenode__bglabel {
//     margin-top: 10px;
//   }

//   & .updatenode__checkboxwrapper {
//     margin-top: 10px;
//     display: flex;
//     align-items: center;
//   }

//   & .confirm_btn_wrap {
//     display: inline-flex;
//     width: 100%;
//   }
// `;
// export default function RoadMapCanvas({
//   editor,
//   label,
//   roadMapTitle,
//   roadmapImage,
//   toggleEditor,
//   roadmapDescription,
//   roadmapTag,
//   setLabel,
//   onRoadMapTitleChange,
//   setRoadMapTitle,
//   id,
//   onChangeLabel,
//   setState,
//   state,
//   onChangeId,
//   setId,
// }) {
//   return (
//     <ReactFlowProvider>
//       <Roadmap
//         editor={editor}
//         setState={setState}
//         label={label}
//         roadMapTitle={roadMapTitle}
//         roadmapImage={roadmapImage}
//         toggleEditor={toggleEditor}
//         roadmapDescription={roadmapDescription}
//         onRoadMapTitleChange={onRoadMapTitleChange}
//         roadmapTag={roadmapTag}
//         setRoadMapTitle={setRoadMapTitle}
//         setLabel={setLabel}
//         state={state}
//         onChangeId={onChangeId}
//         onChangeLabel={onChangeLabel}
//         id={id}
//         setId={setId}
//       />
//     </ReactFlowProvider>
//   );
// }