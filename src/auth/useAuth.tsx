import axios, { AxiosResponse } from 'axios';

import { axiosInstance } from '../axiosInstance';
import { useUser } from '../components/user/hooks/useUser';
import { User } from '../types/types';

interface UseAuth {
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname: string) => Promise<void>;
  signout: () => void;
}

type UserResponse = { user: User };
type ErrorResponse = { message: string };
type AuthResponseType = UserResponse | ErrorResponse;

export function useAuth(): UseAuth {
  const SERVER_ERROR = 'There was an error contacting the server.';
  const { clearUser, updateUser } = useUser();

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
          headers: { 'Content-Type': 'application/json' },
        });
      if (status === 201) {
        // eslint-disable-next-line no-alert
        alert(`status code : ${status}! 회원가입 성공`);
      }

      if ('user' in data && 'token' in data.user) {
        // update stored user data
        updateUser(data.user);
      }
    } catch (errorResponse) {
      const status =
        axios.isAxiosError(errorResponse) && errorResponse?.response?.status
          ? errorResponse?.response?.status
          : SERVER_ERROR;
      status === 409
        ? // eslint-disable-next-line no-alert
          alert(`status code : ${status}! already a member!`)
        : // eslint-disable-next-line no-alert
          alert(`status code : ${status}!`);
    }
  }

  async function signin(email: string, password: string): Promise<void> {
    authServerCall('/members/signin', email, password, '');
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
  }

  return {
    signin,
    signup,
    signout,
  };
}
