// pages/api/korea-home.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Video } from '../../app/types/video';

// 섹션별 데이터를 반환하기 위한 인터페이스
interface KoreaSection {
  title: string;
  videos: Video[];
  moreLink: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KoreaSection[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const targetUrl = 'https://bokepkorea.tv/';
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': targetUrl,
      },
      timeout: 15000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const sections: KoreaSection[] = [];

    // BokepKorea의 특정 위젯 ID들을 배열로 정의
    const widgetIds = [
      'widget_videos_block-9',  // Bokep Korean Sex Terbaru
      'widget_videos_block-11', // Korean Porn Viral Terbaru
      'widget_videos_block-10'  // Bokep Korea Live Cam
    ];

    widgetIds.forEach((widgetId) => {
      const sectionEl = $(`#${widgetId}`);
      if (sectionEl.length > 0) {
        const title = sectionEl.find('h2.widget-title').text().trim();
        const moreLink = sectionEl.find('a.more-videos').attr('href') || '';
        
        const videos: Video[] = [];

        sectionEl.find('article.thumb-block').each((_, article) => {
          const id = $(article).data('post-id')?.toString() || '';
          const videoTitle = $(article).find('header.entry-header span').text().trim();
          const thumbnail = $(article).find('img.video-main-thumb').attr('src') || '';
          
          // 시간 텍스트 정리 (아이콘 태그 제거)
          const duration = $(article).find('span.duration').text().replace(/[\n\r]+|^\s+|\s+$|<[^>]*>/g, '').trim();
          
          const hd = $(article).find('span.hd-video').length > 0;
          const link = $(article).find('a').attr('href') || '';

          // 카테고리 정보가 article 클래스나 내부 데이터에 없으므로 섹션 제목을 사용하거나 기본값 설정
          const category = 'Korean Amateur'; 

          if (id && videoTitle && thumbnail && link) {
            videos.push({
              id,
              title: videoTitle,
              thumbnail,
              duration,
              hd,
              link,
              category,
            });
          }
        });

        if (videos.length > 0) {
          sections.push({
            title,
            videos,
            moreLink
          });
        }
      }
    });

    res.status(200).json(sections);
  } catch (error) {
    console.error('Error fetching BokepKorea data:', error);
    res.status(500).json({ error: 'Failed to fetch Korea data' });
  }
}