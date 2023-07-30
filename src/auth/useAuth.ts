import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { MemberInfo, NewUser, TokenInfo } from 'types/types';

import { axiosInstance } from '../axiosInstance';
import { useUser } from '../components/user/hooks/useUser';

interface UseAuth {
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname: string) => Promise<void>;
  signout: () => void;
}

// type UserResponse = { data: NewUser };
type UserResponse = { data: { member: MemberInfo; tokenInfo: TokenInfo } };
type ErrorResponse = { message: string };
type AuthResponseType = UserResponse | ErrorResponse;

export function useAuth(): UseAuth {
  const SERVER_ERROR = 'There was an error contacting the server.';
  const { clearUser, updateUser } = useUser();
  const navigate = useNavigate();

  async function authServerCall(
    urlEndpoint: string,
    email: string,
    password: string,
    nickname?: string,
  ): Promise<void> {
    try {
      const { data, status }: AxiosResponse<AuthResponseType> =
        await axiosInstance({
          url: urlEndpoint,
          method: 'POST',
          data: { email, password, nickname },
          headers: {
            'Content-Type': 'application/json',
          },
        });
      if (status === 201 || status === 200) {
        // updateUser({
        //   memberId: 0,
        //   avatarUrl: '',
        //   baekjoonId: '',
        //   bio: '',
        //   blogUrl: '',
        //   email,
        //   exp: 0,
        //   githubUrl: '',
        //   level: 0,
        //   nickname,
        //   inProcessRoadmapDto: [],
        // });
        // updateUser(data);
        console.log('useAuth ServiceCall', data);
        // navigate('/');
      }
      // if ('accessToken' in data) {
      //   updateUser(data.accessToken);
      // }

      // eslint-disable-next-line no-console
      // console.log('authServerCall', data);
      // update stored user data
      // updateUser(data.user);

      // if ('user' in data) {
      //   // update stored user data
      //   updateUser(data.user);
      // }
    } catch (errorResponse) {
      const status =
        axios.isAxiosError(errorResponse) && errorResponse?.response?.status
          ? errorResponse?.response?.status
          : SERVER_ERROR;
      if (status === 409) {
        // eslint-disable-next-line no-alert
        alert('이미 등록된 회원입니다.');
      }
    }
  }
  async function authLoginServerCall(
    urlEndpoint: string,
    email: string,
    password: string,
  ): Promise<void> {
    try {
      const { data, status }: AxiosResponse<AuthResponseType> =
        await axiosInstance({
          url: urlEndpoint,
          method: 'POST',
          data: { email, password },
          headers: {
            'Content-Type': 'application/json',
          },
        });
      if (status === 201 || status === 200) {
        console.log('useAuth authLoginServerCall', data);
        // const { accessToken } = data.user;
        // const { member, tokenInfo } = data;
        if ('member' in data) {
          console.log('member', data.member);
          const loggedMember: NewUser = data.member;
        }
        if ('tokenInfo' in data) {
          console.log('tokenInfo', data.tokenInfo);
        }
        if ('member' in data && 'tokenInfo' in data) {
          const loggedMember: NewUser = data.member;
          const loggedMemberToken: TokenInfo = data.tokenInfo;
          // updateUser(data.member);
          updateUser({
            accessToken: loggedMemberToken?.accessToken,
            nickname: loggedMember?.nickname,
            email: loggedMember?.email,
          });
          // JSON.parse(
          //   JSON.stringify(data.tokenInfo) + JSON.stringify(data.member),
          // ),
          alert('로그인 성공');
          navigate('/');
        }
        // updateUser(data); // 이 부분 타입 맞추기

        // localStorage.setItem('accessToken', JSON.stringify(data));
        // localStorage.setItem('user', JSON.stringify(data));
        // console.log('useAuth', data);
        // navigate('/');
        // if ('tokenInfo' in data) {
        // if ('tokenInfo' in data ) {
        // updateUser({data.tokenInfo});
        // alert('로그인 성공');
        // navigate('/');
        // }
        // updateUser({ username, tokenInfo });
        // if ('accessToken' in data) {
        //   // update stored user data
        //   // updateUser(data.accessToken);
        //   updateUser(data.accessToken);
        //   navigate('/');
        // }
      }
    } catch (errorResponse) {
      const status =
        axios.isAxiosError(errorResponse) && errorResponse?.response?.status
          ? errorResponse?.response?.status
          : SERVER_ERROR;
      status === 403
        ? // eslint-disable-next-line no-alert
          alert('이메일과 비밀번호가 일치하지 않습니다.')
        : // eslint-disable-next-line no-alert
          alert(`status code : ${status}!`);
    }
  }

  async function signin(email: string, password: string): Promise<void> {
    authLoginServerCall('/members/signin', email, password);
    // authServerCall('/members/signin', email, password);
  }
  async function signup(
    email: string,
    password: string,
    nickname: string,
  ): Promise<void> {
    authServerCall('/members/signup', email, password, nickname);
  }

  function signout(): void {
    // clear user from stored user data
    clearUser();

    // eslint-disable-next-line no-alert
    alert(`logged out!`);
    navigate('/');
  }

  return {
    signin,
    signup,
    signout,
  };
}
