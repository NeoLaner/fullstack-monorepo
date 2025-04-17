/* eslint-disable */
import { type HLSSrc, type VideoSrc } from "@vidstack/react";
import {
  CINEMETA_URL,
  OPENSUBTITLES_URL,
  STREMIO_API_URL,
  STREMIO_STREAMING_SERVER,
} from "~/lib/stremio";
import { ProbeResponse, type MetaInfo } from "./types";

function generateRandomId(): string {
  const characters = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

export type MovieSearchResult = {
  id: string;
  imdb_id: string;
  type: string;
  name: string;
  releaseInfo: string;
  poster: string;
  links: any[];
  behaviorHints: {
    defaultVideoId: string;
    hasScheduledVideos: boolean;
  };
};

const StremioService = {
  async isServerOpen() {
    try {
      const response = await fetch(`${STREMIO_STREAMING_SERVER}/stats.json`);
      if (!response.ok) throw new Error("Server not available");
      return true;
    } catch {
      return false;
    }
  },

  async getPopularMovies() {
    const response = await fetch(`${CINEMETA_URL}/catalog/movie/top.json`);
    if (!response.ok) throw new Error("Failed to fetch popular movies");
    const data = (await response.json()) as { metas: MetaInfo[] };
    return data.metas;
  },

  async getPopularSeries() {
    const response = await fetch(`${CINEMETA_URL}/catalog/series/top.json`);
    if (!response.ok) throw new Error("Failed to fetch popular series");
    const data = (await response.json()) as { metas: MetaInfo[] };
    return data.metas;
  },

  async getMetaSeries(imdbId: string) {
    const response = await fetch(`${CINEMETA_URL}/meta/series/${imdbId}.json`);
    if (!response.ok) throw new Error("Failed to fetch series metadata");
    const data = await response.json();
    return data.meta as MetaInfo;
  },

  async getMetaMovie(imdbId: string) {
    const response = await fetch(`${CINEMETA_URL}/meta/movie/${imdbId}.json`);
    if (!response.ok) throw new Error("Failed to fetch movie metadata");
    const data = await response.json();
    return data.meta as MetaInfo;
  },

  async searchMovies(title: string) {
    const response = await fetch(
      `${CINEMETA_URL}/catalog/movie/top/search=${title}.json`,
    );
    if (!response.ok) throw new Error("Failed to search movies");
    const data = (await response.json()) as { metas: MovieSearchResult[] };
    return data.metas;
  },

  async searchSeries(title: string) {
    const response = await fetch(
      `${CINEMETA_URL}/catalog/series/top/search=${title}.json`,
    );
    if (!response.ok) throw new Error("Failed to search series");
    const data = (await response.json()) as { metas: MovieSearchResult[] };
    return data.metas;
  },

  async getAddons() {
    const response = await fetch(`${STREMIO_API_URL}/addonscollection.json`);
    if (!response.ok) throw new Error("Failed to fetch addons");
    const data = await response.json();
    return data;
  },

  async createTorrentStream(stream: {
    infoHash: string;
    fileIdx: number;
  }): Promise<VideoSrc | HLSSrc> {
    let { infoHash, fileIdx = null } = stream;
    const probeResponse = await fetch(
      `http://127.0.0.1:11470/hlsv2/probe?mediaURL=http://127.0.0.1:11470/${infoHash}/${fileIdx}`,
    );
    if (!probeResponse.ok) throw new Error("Failed to probe media URL");
    const probeData = (await probeResponse.json()) as ProbeResponse;

    if (probeData.format.name.split(",").includes("mp4")) {
      const type = "video/mp4";
      const createResponse = await fetch(
        `${STREMIO_STREAMING_SERVER}/${infoHash}/create`,
      );
      if (!createResponse.ok)
        throw new Error("Failed to create torrent stream");
      const createData = await createResponse.json();
      const { files } = createData;
      if (!fileIdx) {
        fileIdx = files.indexOf(
          files.sort((a: any, b: any) => a.length - b.length).reverse()[0],
        );
      }
      return {
        type,
        src: `${STREMIO_STREAMING_SERVER}/${infoHash}/${fileIdx}`,
      };
    } else {
      const randomId = generateRandomId();
      return {
        type: "application/mpegurl",
        src: `http://127.0.0.1:11470/hlsv2/${randomId}/master.m3u8?mediaURL=http%3A%2F%2F127.0.0.1%3A11470%2F${infoHash}%2F${fileIdx}`,
      } as HLSSrc;
    }
  },

  async getStats(streamUrl: string) {
    const response = await fetch(`${streamUrl}/stats.json`);
    if (!response.ok) throw new Error("Failed to fetch stats");
    const data = await response.json();
    return data;
  },

  async getSubtitles({
    type,
    id,
    url,
  }: {
    type: string;
    id: string;
    url: string;
  }) {
    try {
      const hash = await getOpenSubInfo(url);
      return await queryOpenSubtitles({ type, id, videoHash: hash });
    } catch {
      return [];
    }
  },
};

async function getOpenSubInfo(streamUrl: string) {
  const response = await fetch(
    `${STREMIO_STREAMING_SERVER}/opensubHash?url=${streamUrl}`,
  );
  if (!response.ok) throw new Error("Failed to fetch subtitle info");
  const data = await response.json();
  return data.result;
}

async function queryOpenSubtitles({
  type,
  id,
  videoHash,
}: {
  type: string;
  id: string;
  videoHash: string;
}) {
  const response = await fetch(
    `${OPENSUBTITLES_URL}/subtitles/${type}/${id}/videoHash=${videoHash}.json`,
  );
  if (!response.ok) throw new Error("Failed to fetch subtitles");
  const data = await response.json();
  return data.subtitles;
}

export default StremioService;
