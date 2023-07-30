import {
  ActionIcon,
  Box,
  Button,
  Center,
  createStyles,
  Group,
  Header,
  Image,
  Modal,
  rem,
  TextInput,
  TextInputProps,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconArrowRight, IconSearch } from '@tabler/icons-react';
import { useInput } from 'components/common/hooks/useInput';
import { usePrompt } from 'components/prompts/hooks/usePrompt';
import { usePromptAnswer } from 'components/prompts/hooks/usePromptResponse';
import { queryClient } from 'react-query/queryClient';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearStoredGpt } from 'storage/gpt-storage';
import { clearStoredRoadmap } from 'storage/roadmap-storage';

import { useAuth } from '../../../auth/useAuth';
import { useUser } from '../../../components/user/hooks/useUser';

const useStyles = createStyles((theme) => ({
  link: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan('sm')]: {
      height: rem(42),
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    '&:active': theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: `calc(${theme.spacing.md} * -1)`,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
    // paddingBottom: theme.spacing.xl,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
}));

export function HeaderMegaMenu() {
  const { classes } = useStyles();
  const navigate = useNavigate();
  // const user = useUser();
  const { signout } = useAuth();
  const { pathname } = useLocation();
  const [opened, { open, close }] = useDisclosure(false);
  console.log(pathname);
  return (
    <Box pb={30}>
      <Header height={60} px="md">
        <Group position="apart" sx={{ height: '100%' }}>
          <Group
            sx={{ height: '100%' }}
            spacing={0}
            className={classes.hiddenMobile}
          >
            <Image
              src="/img/logo.png"
              width={200}
              height={50}
              onClick={() => navigate('..')}
            />
            <SearchButton ml="5rem" />
          </Group>

          <Group className={classes.hiddenMobile}>
            <Modal opened={opened} onClose={close} size="70%">
              <Center>
                <h1>새로운 로드맵 생성하기</h1>
              </Center>
              <Center>
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDEv4qC_L_0WLYmLRBtBd2sYGkjMzWvGqrOw&usqp=CAU"
                  width={300}
                  height={280}
                />
              </Center>
              <Center>
                <InputWithButton />
              </Center>
              <Center mt={50}>
                <h5>오늘은 그냥 템플릿 없이 빈 로드맵 만들게요.</h5>
                <Button
                  size="xs"
                  variant="light"
                  color="blue"
                  onClick={() => {
                    clearStoredRoadmap();
                    clearStoredGpt();
                    if (!user || !('accessToken' in user)) {
                      alert('로그인 후 이용가능합니다.');
                      navigate('/users/signin');
                    }
                    navigate('/roadmap/editor');
                  }}
                >
                  빈 로드맵 만들기
                </Button>
              </Center>
            </Modal>
           <Group position="center">
              {pathname !== '/roadmap/editor' && (
                <Button onClick={open} variant="light" color="indigo">
                  로드맵 생성하기
                </Button>
              )}
            </Group>
            {/* {user && 'accessToken' in user ? ( */}
            {user && 'accessToken' in user ? (
              <>
                <NavLink to="/users/mypage">{user.nickname}님</NavLink>
                <Button onClick={() => signout()}>Sign out</Button>
              </>
            ) : (
              <Button onClick={() => navigate('/users/signin')}>Sign in</Button>
            )}
          </Group>
        </Group>
      </Header>
    </Box>
  );
}

function InputWithButton(props: TextInputProps) {
  const theme = useMantineTheme();
  const [prompt, onPromptChange, setPrompt] = useInput('');
  const { getprompt } = usePrompt();
  const navigate = useNavigate();
  const { user } = useUser();
  const { clearGptAnswer, updateGptAnswer } = usePromptAnswer();
  const onRequestPrompt = (p) => {
    // getprompt(p.prompt);
    // queryClient.prefetchQuery(['roadmapById', currentPage], () =>
    // queryClient.prefetchQuery(['recent_gpt_search', p.prompt], () =>
    // queryClient.prefetchQuery('recent_gpt_search', () => getprompt(p.prompt));
    // queryClient.prefetchQuery('prompts', () => getprompt(p.prompt));
    queryClient.prefetchQuery(['prompts', p.prompt], () => {
      getprompt(p.prompt);
      updateGptAnswer(JSON.parse(localStorage.getItem('recent_gpt_search')));
    });
    // JSON.parse(localStorage.getItem(`['prompts', ${p.prompt}]`)),
    // updateGptAnswer(JSON.parse(localStorage.getItem('recent_gpt_search')));
    // ['prompts', p.prompt],
    // localStorage.getItem(`['prompts', ${p.prompt}]`),
    // localStorage.getItem(`prompts`),
  };

  // useEffect(() => {
  //   if (currentPage) {
  //     queryClient.prefetchQuery(['roadmapById', currentPage], () =>
  //       getRoadmapById(currentPage),
  //     );
  //   }
  // }, [currentPage, queryClient]);
  return (
    <TextInput
      value={prompt}
      onChange={onPromptChange}
      icon={<IconSearch size="1.1rem" stroke={1.5} />}
      radius="md"
      w="600px"
      rightSection={
        <ActionIcon
          size={32}
          onClick={() => {
            setPrompt(prompt);
            if (!user) {
              alert('로그인 후 이용가능합니다.');
              navigate('/users/signin');
            }
            navigate(`/roadmap/editor?title=${prompt}`);
            // clearGptAnswer();
            // onRequestPrompt({ prompt });
          }}
          radius="xl"
          color={theme.primaryColor}
          variant="filled"
        >
          {theme.dir === 'ltr' ? (
            <IconArrowRight size="1.1rem" stroke={1.5} />
          ) : (
            <IconArrowLeft size="1.1rem" stroke={1.5} />
          )}
        </ActionIcon>
      }
      rightSectionWidth={42}
      placeholder="키워드를 입력하세요"
      {...props}
    />
  );
}

export function SearchButton(props: TextInputProps) {
  const theme = useMantineTheme();

  return (
    <TextInput
      icon={<IconSearch size="1.1rem" stroke={1.5} />}
      radius="md"
      w="600px"
      rightSection={
        <ActionIcon
          size={32}
          radius="xl"
          color={theme.primaryColor}
          variant="filled"
        >
          {theme.dir === 'ltr' ? (
            <IconArrowRight size="1.1rem" stroke={1.5} />
          ) : (
            <IconArrowLeft size="1.1rem" stroke={1.5} />
          )}
        </ActionIcon>
      }
      rightSectionWidth={42}
      placeholder="키워드를 입력하세요"
      {...props}
    />
  );
}
