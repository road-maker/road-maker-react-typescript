import { AxiosResponse } from 'axios';
import { useQuery, useQueryClient } from 'react-query';

import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../storage/user-storage';
import type { User } from '../../../types/types';

// async function getUser(user: User | null): Promise<User | null> {
//   if (!user) return null;
//   const { data }: AxiosResponse<{ user: User }> = await axiosInstance.post(
//     // `/members/signin`, // 로그인한 유저가 서버로 유저데이터 요청
//     `/members/${user.nickname}`, // 로그인한 유저가 서버로 유저데이터 요청
//     {
//       headers: getJWTHeader(user.accessToken),
//     },
//   );
//   return data.user;
// }

// interface UseUser {
//   user: User | null;
//   updateUser: (user: User) => void;
//   clearUser: () => void;
// }

// export function useUser(): UseUser {
//   // 서버에서 유저데이터 가져와서 업데이트 해주기
//   const queryClient = useQueryClient();
//   const { data: user } = useQuery(queryKeys.user, () => getUser(user), {
//     initialData: getStoredUser, // 로컬스토리지에 유저 정보 있는지 확인
//     onSuccess: (received: User | null) => {
//       // 유저 정보를 로컬스토리지에 저장
//       !received ? clearStoredUser() : setStoredUser(received);
//     },
//   });

//   // useAuth에서 호출
//   function updateUser(newUser: User): void {
//     // 유저 쿼리 캐시 업데이트
//     queryClient.setQueriesData(queryKeys.user, newUser);
//   }

//   // useAuth에서 호출
//   function clearUser() {
//     queryClient.setQueryData(queryKeys.user, null);
//     // 쿼리 여러개 없애고 싶으면 위의 코드에 인자로 넣어서 보내주기
//   }

//   return { user, updateUser, clearUser };
// }

// import { AxiosResponse } from 'axios';
// import { useQuery, useQueryClient } from 'react-query';

// import type { User } from '../../../../../shared/types';
// import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
// import { queryKeys } from '../../../react-query/constants';
// import {
//   clearStoredUser,
//   getStoredUser,
//   setStoredUser,
// } from '../../../user-storage';

// query function
async function getUser(
  user: User | null,
  signal: AbortSignal,
): Promise<User | null> {
  if (!user || !user.nickname) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    // `/user/${user.id}`,
    `/user/${user.nickname}`,
    {
      signal, // abortSignal from React Query
      headers: getJWTHeader(user?.accessToken),
    },
  );

  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export function useUser(): UseUser {
  const queryClient = useQueryClient();

  // call useQuery to update user data from server
  const { data: user } = useQuery<User>(
    queryKeys.user,
    ({ signal }) => getUser(user, signal),
    {
      // populate initially with user in localStorage
      initialData: getStoredUser,

      onSuccess: (received: null | User) => {
        if (!received) {
          clearStoredUser();
        } else {
          setStoredUser(received);
        }
      },
    },
  );

  function updateUser(newUser: User): void {
    // update the user
    queryClient.setQueryData(queryKeys.user, newUser);
  }

  function clearUser() {
    queryClient.setQueryData(queryKeys.user, null);

    queryClient.removeQueries([queryKeys.nickname, queryKeys.user]);
  }

  return { user, updateUser, clearUser };
}
