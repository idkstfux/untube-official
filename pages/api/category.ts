/* eslint-disable prefer-const */
// pages/api/category.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { CategoryResponse, FilterOption } from '../../app/types/category-response';
import { Video } from '../../app/types/video';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CategoryResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let { url: rawUrl, data, page = '1' } = req.query;
  let url = '';

  if (data && typeof data === 'string') {
    try {
        url = Buffer.from(data, 'base64').toString('utf-8');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        res.status(400).json({ error: 'Invalid data parameter encoding' });
        return;
    }
  } else if (rawUrl && typeof rawUrl === 'string') {
      url = rawUrl;
  }

  if (!url) {
    res.status(400).json({ error: 'Data/URL parameter is required' });
    return;
  }

  // URL 생성 로직
  if (page !== '1' && typeof page === 'string') {
    if (!url.includes('/page/')) {
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace(/\/$/, '');
      urlObj.pathname = `${path}/page/${page}/`;
      url = urlObj.toString();
    } else {
      url = url.replace(/\/page\/\d+\//, `/page/${page}/`);
    }
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
      },
      timeout: 15000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const categoryName = $('header.page-header h1 span').text().trim() || $('h1.archive-title').text().trim() || 'Kategori';

    const filters: FilterOption[] = [];
    $('#filters .filters-options span a').each((_, el) => {
      const label = $(el).text().trim();
      const filterUrl = $(el).attr('href') || '';
      const isActive = $(el).hasClass('active');
      
      let slug = 'latest';
      if (filterUrl.includes('filter=')) {
        slug = filterUrl.split('filter=')[1].split('&')[0];
      }

      if (label && filterUrl) {
        filters.push({ label, url: filterUrl, isActive, slug });
      }
    });

    const videos: Video[] = [];
    $('article.thumb-block.video-preview-item').each((_, article) => {
      const id = $(article).data('post-id')?.toString() || '';
      const title = $(article).find('header.entry-header span').text().trim();
      const thumbnail = $(article).find('img.video-main-thumb').attr('src') || '';
      const duration = $(article).find('span.duration').text().replace(/[\n\r]+|^\s+|\s+$|<[^>]*>/g, '').trim();
      const hd = $(article).find('span.hd-video').length > 0;
      const link = $(article).find('a').attr('href') || '';

      if (id && title && thumbnail && link) {
        videos.push({
          id, title, thumbnail, duration, hd, link, category: categoryName
        });
      }
    });

    if (videos.length === 0) {
      res.status(200).json({
        categoryName, videos: [], currentPage: 1, totalPages: 1, nextPageUrl: null, prevPageUrl: null, filters: []
      });
      return;
    }

    const currentPage = parseInt($('.pagination .current').text().trim() || '1', 10);
    let totalPages = 1;
    
    const lastLink = $('.pagination a:contains("Last")').attr('href');
    if (lastLink) {
      const match = lastLink.match(/\/page\/(\d+)\//);
      if (match) totalPages = parseInt(match[1], 10);
    } else {
        $('.pagination ul li a').each((_, el) => {
            const txt = $(el).text();
            const num = parseInt(txt);
            if (!isNaN(num) && num > totalPages) totalPages = num;
        });
    }

    const nextPageUrl = $('.pagination a:contains("Next")').attr('href') || null;
    const prevPageUrl = $('.pagination a:contains("Previous")').attr('href') || null;

    res.status(200).json({
      categoryName,
      videos,
      currentPage,
      totalPages,
      nextPageUrl,
      prevPageUrl,
      filters
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category data' });
  }
}