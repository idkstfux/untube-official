// pages/api/videos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Video } from '../../app/types/video';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Video[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Fetch the HTML from the website
    const response = await axios.get('https://www.avtub.net/');
    const html = response.data;

    // Load HTML into cheerio for parsing
    const $ = cheerio.load(html);

    const videos: Video[] = [];

    // Parse sections
    $('section.widget_videos_block').each((_, section) => {
      const category = $(section).find('h2.widget-title').text().trim();

      $(section).find('article.thumb-block').each((_, article) => {
        const id = $(article).data('post-id')?.toString() || '';
        const title = $(article).find('header.entry-header span').text().trim();
        const thumbnail = $(article).find('img.video-main-thumb').attr('src') || '';
        const duration = $(article).find('span.duration').text().trim().replace('<i class="fa fa-clock-o"></i> ', '');
        const hd = $(article).find('span.hd-video').length > 0;
        const link = $(article).find('a').attr('href') || '';

        if (id && title && thumbnail && link) {
          videos.push({
            id,
            title,
            thumbnail,
            duration,
            hd,
            link,
            category,
          });
        }
      });
    });

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}