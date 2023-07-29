/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import { AxiosResponse } from 'axios';
import { axiosInstance } from 'axiosInstance';
import { useUser } from 'components/user/hooks/useUser';
import { useNavigate } from 'react-router-dom';

import { NewRoadmap, Roadmap } from '../../../editor/types';

interface UseRoadmap {
  getRoadmapById: (id: number) => Promise<void>;
  getRoadmapByIdAuth: (id: number) => Promise<void>;
  getAllRoadmap: () => Promise<void>;
  postRoadmap: (NewRoadmap: NewRoadmap) => Promise<void>;
  joinRoadmap: (id: number) => Promise<void>;
  updateRoadmapProgress: (id: number) => Promise<void>;
}

type ErrorResponse = { message: string };
type GetResponse = { message: number };
type RoadMapResponse = { roadmap: Array<Roadmap> } | GetResponse;
export function useRoadmap(): UseRoadmap {
  const SERVER_ERROR = 'error contacting server';
  const navigate = useNavigate();
  const { user } = useUser();

  async function roadmapServerCall(
    urlEndpoint: string,
    id?: number,
  ): Promise<void> {
    try {
      const { data, status }: AxiosResponse<RoadMapResponse> =
        await axiosInstance({
          url: urlEndpoint,
          method: 'GET',
          data: { id },
          headers: { 'Content-Type': 'application/json' },
        });
      if (status === 200) {
        !id
          ? localStorage.setItem(
              'roadmaps',
              JSON.stringify({ data }), // 전체 로드맵 list 저장
            )
          : localStorage.setItem(
              'roadmapById',
              JSON.stringify({ data }), // id에 대한 roadmap 저장
            );
      }
    } catch (errorResponse) {
      console.log(`${SERVER_ERROR}!: ${errorResponse}`);
    }
  }
  async function roadmapAuthServerCall(
    urlEndpoint: string,
    id?: number,
  ): Promise<void> {
    try {
      const { data, status }: AxiosResponse<RoadMapResponse> =
        await axiosInstance({
          url: urlEndpoint,
          method: 'GET',
          data: { id },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
      if (status === 200) {
        !id
          ? localStorage.setItem(
              'roadmaps',
              JSON.stringify({ data }), // 전체 로드맵 list 저장
            )
          : localStorage.setItem(
              'roadmapById',
              JSON.stringify({ data }), // id에 대한 roadmap 저장
            );
      }
    } catch (errorResponse) {
      console.log(`${SERVER_ERROR}!: ${errorResponse}`);
    }
  }
  async function roadmapPostSeverCall(
    urlEndpoint: string,
    newroadmap: NewRoadmap,
  ): Promise<void> {
    try {
      const { data, status }: AxiosResponse<RoadMapResponse> =
        await axiosInstance({
          url: urlEndpoint,
          method: 'POST',
          data: { ...newroadmap },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
            // Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzaWdudXBAbmF2ZXIuY29tIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTY5MDk3Nzk2Mn0.5XZmXtA2arG_VsEJN5SwQzBj5P2LHFMvdw4Ha8JZVTY`,
          },
        });
      if (status === 200) {
        console.log(data);
      }
      if (status === 404) {
        alert('로드맵을 찾지 못했습니다.');
      }
    } catch (errorResponse) {
      console.log(`${SERVER_ERROR}!: ${errorResponse}`);
    }
  }
  async function roadmapJoinSeverCall(
    urlEndpoint: string,
    id: number,
  ): Promise<void> {
    try {
      const { data, status }: AxiosResponse<RoadMapResponse> =
        await axiosInstance({
          url: urlEndpoint,
          method: 'POST',
          data: { id },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
            // Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzaWdudXBAbmF2ZXIuY29tIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTY5MDk3Nzk2Mn0.5XZmXtA2arG_VsEJN5SwQzBj5P2LHFMvdw4Ha8JZVTY`,
          },
        });
      if (status === 201) {
        alert('참여 성공');
      }
      if (status === 404) {
        alert('로드맵을 찾지 못했습니다.');
      }
      if (status === 409) {
        alert('이미 참여중인 로드맵입니다.');
      }
    } catch (errorResponse) {
      console.log(`${SERVER_ERROR}!: ${errorResponse}`);
      console.log('user', user);
    }
  }
  async function roadmapProgressSeverCall(
    urlEndpoint: string,
    id: number,
  ): Promise<void> {
    try {
      const { status }: AxiosResponse<RoadMapResponse> = await axiosInstance({
        url: urlEndpoint,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${getStoredUser()}`,
          Authorization: `Bearer ${user.accessToken}`,
          // Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzaWdudXBAbmF2ZXIuY29tIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTY5MDk3Nzk2Mn0.5XZmXtA2arG_VsEJN5SwQzBj5P2LHFMvdw4Ha8JZVTY`,
        },
      });
      if (status === 200) {
        console.log('성고적으로 업뎃');
      }
      if (status === 403) {
        console.log('권한이 없습니다.');
      }
    } catch (errorResponse) {
      console.log(`${SERVER_ERROR}!: ${errorResponse}`);
    }
  }
  async function getRoadmapById(id: number): Promise<void> {
    roadmapServerCall(`/roadmaps/load-roadmap/${id}`, id);
  }
  async function getRoadmapByIdAuth(id: number): Promise<void> {
    roadmapAuthServerCall(`/api/roadmaps/${id}/auth`, id);
  }
  async function getAllRoadmap(): Promise<void> {
    roadmapServerCall(`/roadmaps`);
  }

  async function postRoadmap(newRoadmap: NewRoadmap): Promise<void> {
    roadmapPostSeverCall(`/roadmaps`, newRoadmap);
  }

  async function joinRoadmap(id: number): Promise<void> {
    roadmapJoinSeverCall(`/roadmaps/${id}/join`, id);
  }
  async function updateRoadmapProgress(id: number): Promise<void> {
    roadmapJoinSeverCall(`/roadmaps/in-progress-nodes/${id}/done`, id);
  }
  return {
    postRoadmap,
    getRoadmapById,
    getAllRoadmap,
    joinRoadmap,
    updateRoadmapProgress,
    getRoadmapByIdAuth,
  };
}
