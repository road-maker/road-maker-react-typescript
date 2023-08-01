import { Carousel } from '@mantine/carousel';
import {
  Card,
  createStyles,
  Group,
  Image,
  Paper,
  PaperProps,
  Progress,
  rem,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import axios from 'axios';
import { baseUrl } from 'axiosInstance/constants';
import { useRoadmap } from 'components/roadmaps/posts/hooks/useRoadmap';
import { useRoadmapData } from 'components/roadmaps/posts/hooks/useRoadMapResponse';
import { useEffect, useState } from 'react';
import { queryClient } from 'react-query/queryClient';
import { useNavigate } from 'react-router-dom';

import { useUser } from './hooks/useUser';
// import { useState } from 'react';
// import { useRoadmapData } from '../roadmaps/posts/hooks/useRoadMapResponse';

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  author: {
    padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
    marginTop: theme.spacing.md,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    fontSize: '13px',
  },
}));

export default function UserRoadmap(props: PaperProps) {
  const [joinedRoadmap, setJoinedRoadmap] = useState([]);
  const [savedRoadmap, setSavedRoadmap] = useState([]);
  const { user } = useUser();
  const { classes } = useStyles();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    axios
      .get(`${baseUrl}/members/${user.nickname}/in-progress-roadmaps`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
      })

      .then((v) => {
        setJoinedRoadmap(v?.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${baseUrl}/members/${user.nickname}/roadmaps`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
      })

      .then((v) => {
        setSavedRoadmap(v?.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <>
      <Group position="center" mt={30}>
        <h2>진행 중인 로드맵</h2>
      </Group>
      <Paper
        radius="md"
        px={80}
        py={30}
        mt={40}
        m="auto"
        withBorder
        {...props}
        w={1000}
        h={280}
      >
        <Carousel height={200} slideSize="33.3333%" slideGap="md" align="start">
          {!joinedRoadmap
            ? '아직 진행 중인 로드맵이 없습니다.'
            : joinedRoadmap.map((article) => (
                <Carousel.Slide>
                  <Card
                    key={article.id}
                    radius="md"
                    component="a"
                    className={classes.card}
                  >
                    <Card.Section>
                      {article.thumbnailUrl ? (
                        <Image
                          src={article.thumbnailUrl}
                          alt={`${article.title}.img`}
                          // height={160}
                          // width={260}
                          style={{ cursor: 'pointer' }}
                          onMouseOver={() => {
                            setCurrentPage(article.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            currentPage &&
                              navigate(`/roadmap/post/${currentPage}`);
                          }}
                        />
                      ) : (
                        <Image
                          src="https://t1.daumcdn.net/cfile/tistory/21221F4258E793521D"
                          alt={`${article.title}.img`}
                          height={160}
                          width={260}
                          style={{ cursor: 'pointer' }}
                          onMouseOver={() => {
                            setCurrentPage(article.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            currentPage &&
                              navigate(`/roadmap/post/${currentPage}`);
                          }}
                        />
                      )}
                    </Card.Section>
                    <Text
                      className={classes.title}
                      mt={10}
                      onMouseOver={() => {
                        setCurrentPage(article.id);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        currentPage && navigate(`/roadmap/post/${currentPage}`);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {article?.title}
                    </Text>
                    <Text
                      color="dimmed"
                      size="xs"
                      transform="uppercase"
                      weight={700}
                      mt="md"
                    >
                      {article?.ownerNickname}
                    </Text>
                  </Card>
                </Carousel.Slide>
              ))}
        </Carousel>
      </Paper>

      <Group position="center" mt={30}>
        <h2>내가 만든 로드맵</h2>
      </Group>
      <Paper
        radius="md"
        px={60}
        py={30}
        mt={40}
        m="auto"
        withBorder
        {...props}
        w={1000}
        h={280}
      >
        <Carousel
          slideSize="100%"
          slideGap="33.3333%"
          // breakpoints={[{ maxWidth: 'xl', slideSize: '100%', slideGap: 10 }]
          align="start"
          slidesToScroll={mobile ? 1 : 2}
        >
          {savedRoadmap.length === 0
            ? '아직 만든 로드맵이 없습니다. 로드맵을 생성해보세요!'
            : savedRoadmap.map((article) => (
                <Carousel.Slide>
                  <Card
                    key={article.id}
                    radius="md"
                    component="a"
                    className={classes.card}
                  >
                    <Card.Section>
                      {article.thumbnailUrl ? (
                        <Image
                          src={article.thumbnailUrl}
                          alt={`${article.title}.img`}
                          // height={160}
                          // width={260}
                          style={{ cursor: 'pointer' }}
                          onMouseOver={() => {
                            setCurrentPage(article.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            currentPage &&
                              navigate(`/roadmap/post/${currentPage}`);
                          }}
                        />
                      ) : (
                        <Image
                          src="https://t1.daumcdn.net/cfile/tistory/21221F4258E793521D"
                          alt={`${article.title}.img`}
                          height={160}
                          width={260}
                          style={{ cursor: 'pointer' }}
                          onMouseOver={() => {
                            setCurrentPage(article.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            currentPage &&
                              navigate(`/roadmap/post/${currentPage}`);
                          }}
                        />
                      )}
                    </Card.Section>
                    <Text
                      className={classes.title}
                      mt={10}
                      onMouseOver={() => {
                        setCurrentPage(article.id);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        currentPage && navigate(`/roadmap/post/${currentPage}`);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {article?.title}
                    </Text>
                    <Text
                      color="dimmed"
                      size="xs"
                      transform="uppercase"
                      weight={700}
                      mt="md"
                    >
                      {article?.ownerNickname}
                    </Text>
                  </Card>
                </Carousel.Slide>
              ))}
        </Carousel>
      </Paper>
    </>
  );
}
