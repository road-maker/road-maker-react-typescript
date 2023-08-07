/* eslint-disable no-console */
import {
  ActionIcon,
  Card,
  Container,
  createStyles,
  getStylesRef,
  Group,
  Image,
  Overlay,
  rem,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { IconHeart } from '@tabler/icons-react';
import axios from 'axios';
import { baseUrl } from 'axiosInstance/constants';
import { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useInfiniteQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    columnWidth: '350px',
    columnGap: '15px',
    [`&:hover .${getStylesRef('image')}`]: {
      transform: 'scale(1.03)',
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    padding: '10px',
    marginTop: '11px',
    borderTop: '1px',
  },

  author: {
    padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
    marginTop: theme.spacing.md,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    fontSize: '13px',
  },

  like: {
    color: theme.colors.red[6],
  },

  label: {
    textTransform: 'uppercase',
    fontSize: theme.fontSizes.xs,
    fontWeight: 700,
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    marginBottom: '15px',
    padding: '10px',
    alignItems: 'center',
    gap: '10px',
  },

  itemWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },

  item: {
    maxWidth: '100%',
  },

  hovered: {
    transform: 'scale(1.03)',
    transition: 'transform 500ms ease',
  },
}));

export default function RoadmapRecommendation() {
  const [allRoadmapData, setAllRoadmapData] = useState([]);
  const { classes } = useStyles();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('');
  const [roadmapPage, setRoadmapPage] = useState(1);
  const [hoveredIndexes, setHoveredIndexes] = useState([]);

  const fetchRoadmaps = useCallback(() => {
    axios
      .get(`${baseUrl}/roadmaps?page=${roadmapPage}&order-type=recent`)
      .then((v) => {
        console.log('data', v?.data);
        setAllRoadmapData(v?.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [roadmapPage]);

  const initialUrl = `${baseUrl}/roadmaps?page=${roadmapPage}&order-type=recent`;
  const fetchUrl = async (url) => {
    console.log('url', url);
    const response = await fetch(url);
    return response.json();
  };

  const {
    refetch,
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery(
    'roadmaps',
    ({ pageParam = initialUrl }) => fetchUrl(pageParam),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.result.length !== 0) {
          return lastPage.next;
        }
        return undefined;
      },
      enabled: roadmapPage === 1,
    },
  );

  useEffect(() => {
    setRoadmapPage(1);
    refetch();
    fetchRoadmaps();
  }, [fetchRoadmaps, refetch]);

  if (isLoading) return <div className="loading">Loading...</div>;
  if (isError) return <div>Error! {error.toString()}</div>;

  return (
    <>
      <Group position="center" mt={30} mb={50}>
        {/* <h1>추천 로드맵</h1> */}
      </Group>
      {!allRoadmapData ? (
        <Text>만들어진 로드맵이 없습니다.</Text>
      ) : (
        <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
          <Card radius="md" component="a" p="md" className={classes.card}>
            {data.pages &&
              data.pages.map((pageData, pageIndex) => (
                <Card.Section className={classes.list} key={pageIndex}>
                  {pageData.result.map((article, index) => {
                    const cardIndex = pageIndex * 10 + index;
                    const isHovered = hoveredIndexes.includes(cardIndex);
                    const cardClassName = isHovered
                      ? `${classes.item} ${classes.hovered}`
                      : classes.item;

                    return (
                      <div
                        className={classes.itemWrapper}
                        onMouseOver={() => {
                          setCurrentPage(article.id);
                          setHoveredIndexes((prevIndexes) => [
                            ...prevIndexes,
                            cardIndex,
                          ]);
                        }}
                        onMouseLeave={() => {
                          setHoveredIndexes((prevIndexes) =>
                            prevIndexes.filter((i) => i !== cardIndex),
                          );
                        }}
                        onFocus={() => {
                          setCurrentPage(article.id);
                          setHoveredIndexes((prevIndexes) => [
                            ...prevIndexes,
                            cardIndex,
                          ]);
                        }}
                        onBlur={() => {
                          setHoveredIndexes((prevIndexes) =>
                            prevIndexes.filter((i) => i !== cardIndex),
                          );
                        }}
                        key={cardIndex}
                      >
                        <div className={cardClassName}>
                          <Image
                            src={article.thumbnailUrl}
                            alt={`${article.title}.img`}
                            style={{
                              cursor: 'pointer',
                              zIndex: '5',
                              maxWidth: '100%',
                            }}
                            onClick={() => {
                              currentPage &&
                                navigate(`/roadmap/post/${currentPage}`);
                            }}
                          />
                          {isHovered && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'column',
                                zIndex: 10,
                              }}
                            >
                              <div
                                style={{
                                  color: 'white',
                                  padding: '8px',
                                  fontSize: '12px',
                                  textAlign: 'center',
                                }}
                              >
                                {article.title} 쀼쀼
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </Card.Section>
              ))}
          </Card>
        </InfiniteScroll>
      )}
    </>
  );
}
