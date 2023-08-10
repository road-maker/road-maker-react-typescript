import {
  Button,
  Center,
  createStyles,
  Modal,
  Paper,
  rem,
  SimpleGrid,
  Text,
  Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useInfiniteQuery } from 'react-query';
import { useLocation } from 'react-router-dom';

import { baseUrl } from '../../axiosInstance/constants';
import { useUser } from '../../components/user/hooks/useUser';

const useStyles = createStyles((theme) => ({
  body: {
    paddingLeft: rem(54),
    paddingTop: theme.spacing.sm,
  },
}));

function CommentPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const { classes } = useStyles();
  const [commentPage, setCommentPage] = useState(1);
  const { pathname } = useLocation();
  const [content, setContent] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const { user } = useUser();

  const fetchComments = useCallback(() => {
    axios
      .get(
        `${baseUrl}/roadmaps/load-roadmap/${pathname.slice(
          pathname.lastIndexOf('/') + 1,
        )}/comments?page=${commentPage}&size=5`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then((v) => {
        setContent(v?.data);
      })
      .catch();
  }, [commentPage, pathname]);

  const {
    refetch,
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery(
    'comments',
    ({ pageParam = initialUrl }) => fetchUrl(pageParam),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.result.length !== 0) {
          return lastPage.next;
        }
        return undefined;
      },
      enabled: commentPage === 1,
    },
  );

  useEffect(() => {
    setCommentPage(1);
    refetch();
    fetchComments();
  }, [commentPage, fetchComments, pathname, refetch, user.accessToken]);

  const initialUrl = `${baseUrl}/roadmaps/load-roadmap/${pathname.slice(
    pathname.lastIndexOf('/') + 1,
  )}/comments?page=${commentPage}&size=5`;

  const fetchUrl = async (url) => {
    const response = await fetch(url);
    return response.json();
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (isError) return <div>Error! {error.toString()}</div>;

  const handleCommentContentChange = (event) => {
    setCommentInput(event.target.value);
  };

  function handleSubmit() {
    axios
      .post(
        `${baseUrl}/comments/save-comment`,
        {
          content: commentInput,
          roadmapId: Number(pathname.slice(pathname.lastIndexOf('/') + 1)),
        },
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .then(() => {
        fetchComments();
        refetch();
      })
      .catch();
  }
  return (
    <>
      <Modal opened={opened} onClose={close}>
        <Center>
          <h2>코멘트 작성</h2>
        </Center>
        <Textarea
          autosize
          minRows={5}
          maxRows={10}
          mt={30}
          placeholder="내용을 입력하세요"
          name="content"
          onChange={handleCommentContentChange}
        />
        <Center>
          <Button
            mt={30}
            onClick={() => {
              handleSubmit();
              close();
            }}
          >
            작성하기
          </Button>
        </Center>
      </Modal>
      <Center mt={20}>
        <Button onClick={open}>코멘트 작성하기</Button>
      </Center>
      {content.length === 0 ? (
        <Paper withBorder shadow="md" radius="xs" p="xl" ta="center" mt={20}>
          댓글이 없습니다.
        </Paper>
      ) : (
        <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
          <SimpleGrid
            key={user.id}
            cols={1}
            spacing="xl"
            mt={70}
            breakpoints={[{ maxWidth: 'md', cols: 1 }]}
          >
            {data.pages.map((pageData) => {
              return pageData.result.map((comments, index) => (
                <Paper withBorder radius="xs" p="xl" key={index}>
                  <Text className={classes.body} size="sm">
                    {comments.content}
                  </Text>
                </Paper>
              ));
            })}
          </SimpleGrid>
        </InfiniteScroll>
      )}
    </>
  );
}

export default CommentPage;
