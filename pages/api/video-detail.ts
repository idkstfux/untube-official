// pages/api/video-detail.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { VideoDetail } from '../../app/types/video-detail';
import { Video } from '../../app/types/video';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VideoDetail | { error: string; details?: string }>
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url: rawUrl, data } = req.query;
  let url = '';

  if (data && typeof data === 'string') {
      try {
          url = Buffer.from(data, 'base64').toString('utf-8');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
          res.status(400).json({ error: 'Invalid data encoding' });
          return;
      }
  } else if (rawUrl && typeof rawUrl === 'string') {
      url = rawUrl;
  }

  if (!url) {
    res.status(400).json({ error: 'URL/Data parameter is required' });
    return;
  }

  // 도메인 감지 및 Referer 설정
  let referer = 'https://www.avtub.net/';
  if (url.includes('bokepkorea.tv')) {
    referer = 'https://bokepkorea.tv/';
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': referer,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('meta[itemprop="name"]').attr('content') || $('h1.entry-title').text().trim() || 'No Title';
    
    let description = $('meta[itemprop="description"]').attr('content') || '';
    if (!description) {
        description = $('.video-description .desc').text().trim();
    }

    const thumbnail = $('meta[itemprop="thumbnailUrl"]').attr('content') || '';
    const uploadDate = $('meta[itemprop="uploadDate"]').attr('content') || '';
    const durationISO = $('meta[itemprop="duration"]').attr('content') || '';

    const embedUrl = $('.responsive-player iframe').attr('src') || '';
    const downloadUrl = $('#tracking-url').attr('href') || '';

    const tags: string[] = [];
    $('.video-description .desc a').each((_, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.push(tag);
    });

    const relatedVideos: Video[] = [];
    
    // bokepkorea와 avtub의 구조가 매우 유사하므로 동일 선택자 사용 가능
    $('.under-video-block article.thumb-block').each((_, article) => {
      const id = $(article).data('post-id')?.toString() || '';
      const relTitle = $(article).find('header.entry-header span').text().trim();
      const relThumbnail = $(article).find('img.video-main-thumb').attr('src') || '';
      const relDuration = $(article).find('span.duration').text().replace(/[\n\r]+|^\s+|\s+$|<[^>]*>/g, '').trim(); 
      const hd = $(article).find('span.hd-video').length > 0;
      const relLink = $(article).find('a').attr('href') || '';
      
      if (relLink && relTitle) {
        relatedVideos.push({
          id,
          title: relTitle,
          thumbnail: relThumbnail,
          duration: relDuration,
          hd,
          link: relLink,
          category: '',
        });
      }
    });

    const videoDetail: VideoDetail = {
      title,
      description,
      embedUrl,
      downloadUrl,
      thumbnail,
      uploadDate,
      duration: durationISO,
      tags,
      relatedVideos,
    };

    res.status(200).json(videoDetail);

  } catch (error: unknown) {
      console.error('ERROR FETCHING VIDEO DETAIL:', error);
      res.status(500).json({
          error: 'Failed to fetch video details',
          details: error instanceof Error ? error.message : 'Unknown error',
      });
  }   
}