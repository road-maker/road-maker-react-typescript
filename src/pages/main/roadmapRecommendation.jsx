import {
  ActionIcon,
  Card,
  Container,
  createStyles,
  Group,
  Image,
  rem,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { IconBookmark, IconHeart, IconShare } from '@tabler/icons-react';
import { useRoadmap } from 'components/roadmaps/hooks/useRoadmap';
import { useRoadmapData } from 'components/roadmaps/hooks/useRoadMapResponse';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useInfiniteQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

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

const initialUrl = '/roadmaps/load-roadmap';
const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export default function RoadmapRecommendation() {
  const [allRoadmapData, setAllRoadmapData] = useState([]);

  const { classes, theme } = useStyles();
  const navigate = useNavigate();
  const { getAllRoadmap } = useRoadmap();
  const { roadmaps } = useRoadmapData();

  useEffect(() => {
    getAllRoadmap();
    if (roadmaps !== undefined) {
      setAllRoadmapData(roadmaps?.data);
    }
  }, [getAllRoadmap, roadmaps]);

  const { fetchNextPage, hasNextPage, isLoading, isError, error } =
    useInfiniteQuery(
      'roadmaps',
      ({ pageParam = initialUrl }) => fetchUrl(pageParam),
      {
        getNextPageParam: (lastPage) => lastPage.next || undefined,
      },
    );

  if (isLoading) return <div className="loading">Loading...</div>;
  if (isError) return <div>Error! {error.toString()}</div>;

  const cards = !allRoadmapData
    ? '아직 만들어진 로드맵이 없습니다.'
    : allRoadmapData.map((article) => (
        <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
          <Card
            key={article.id}
            radius="md"
            component="a"
            className={classes.card}
            ml={100}
          >
            <Card.Section>
              {article.thumbnailUrl ? (
                <Image
                  src={article.thumbnailUrl}
                  alt={`${article.title}.img`}
                  height={160}
                  width={260}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigate(`/roadmap/editor/view/${article.id}`);
                  }}
                />
              ) : (
                <Image
                  src="https://t1.daumcdn.net/cfile/tistory/21221F4258E793521D"
                  alt={`${article.title}.img`}
                  height={160}
                  width={260}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigate('/roadmap/editor/view');
                  }}
                />
              )}
            </Card.Section>
            <Text
              className={classes.title}
              mt={10}
              onClick={() => {
                navigate('/roadmap/editor/view');
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
              권장 수행 시간 : {`#${article.recommendedExecutionTimeValue}`}{' '}
              {`#${article.recommendedExecutionTimeValue}`}
            </Text>
            <Group spacing={5}>
              <ActionIcon>
                <IconHeart
                  size="1.2rem"
                  color={theme.colors.red[6]}
                  stroke={1.5}
                />
              </ActionIcon>
              <ActionIcon>
                <IconBookmark
                  size="1.2rem"
                  color={theme.colors.yellow[6]}
                  stroke={1.5}
                />
              </ActionIcon>
              <ActionIcon>
                <IconShare
                  size="1.2rem"
                  color={theme.colors.blue[6]}
                  stroke={1.5}
                />
              </ActionIcon>
            </Group>
          </Card>
        </InfiniteScroll>
      ));

  return (
    <>
      <Group position="center" mt={30} mb={50}>
        <h1>추천 로드맵</h1>
      </Group>
      <Container maw={1400}>
        <SimpleGrid
          cols={4}
          breakpoints={[
            { maxWidth: 'sm', cols: 2 },
            { maxWidth: 'sm', cols: 1 },
          ]}
          spacing="sm"
        >
          {cards}
        </SimpleGrid>
      </Container>
    </>
  );
}