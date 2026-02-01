/* eslint-disable prefer-const */
// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResponse, SearchFilterOption } from '../../app/types/search-response';
import { Video } from '../../app/types/video';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Tambahkan parameter 'domain'
  let { q, page = '1', filter, domain } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'Search query (q) is required' });
    return;
  }

  // --- KONFIGURASI DOMAIN ---
  let baseUrl = 'https://www.avtub.net/';
  let referer = 'https://www.avtub.net/';

  // Jika parameter domain='korea', ganti target ke BokepKorea
  if (domain === 'korea') {
    baseUrl = 'https://bokepkorea.tv/';
    referer = 'https://bokepkorea.tv/';
  }

  // --- KONSTRUKSI URL ---
  // Format Avtub/BokepKorea:
  // Page 1: https://site.com/?s=keyword&filter=latest
  // Page 2: https://site.com/page/2/?s=keyword&filter=latest
  
  let targetUrl = baseUrl;
  
  if (page !== '1') {
    targetUrl += `page/${page}/`;
  }

  const params = new URLSearchParams();
  params.append('s', q);
  
  if (filter && typeof filter === 'string') {
    params.append('filter', filter);
  }

  targetUrl += `?${params.toString()}`;

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': referer, // Penting agar tidak 403
      },
      timeout: 15000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 1. Parsing Filters
    const filters: SearchFilterOption[] = [];
    $('#filters .filters-options span a').each((_, el) => {
      const label = $(el).text().trim();
      const href = $(el).attr('href') || '';
      
      // Cek active class atau URL match
      const isActive = $(el).hasClass('active') || href.includes(`filter=${filter}`);
      
      let filterValue = 'latest'; 
      if (href.includes('filter=')) {
        const match = href.match(/filter=([^&]+)/);
        if (match) filterValue = match[1];
      }

      if (label) {
        filters.push({ label, value: filterValue, isActive });
      }
    });

    // Fallback filters jika kosong
    if (filters.length === 0) {
       const standardFilters = [
         { label: 'Latest videos', value: 'latest' },
         { label: 'Most viewed videos', value: 'most-viewed' },
         { label: 'Longest videos', value: 'longest' },
         { label: 'Popular videos', value: 'popular' },
         { label: 'Random videos', value: 'random' }
       ];
       standardFilters.forEach(f => {
         filters.push({
           ...f,
           isActive: filter === f.value || (!filter && f.value === 'latest')
         });
       });
    }

    // 2. Parsing Videos
    const videos: Video[] = [];
    $('article.thumb-block.video-preview-item').each((_, article) => {
      const id = $(article).data('post-id')?.toString() || '';
      // BokepKorea kadang pakai atribut title di <a>, kadang header span
      let title = $(article).find('header.entry-header span').text().trim();
      if (!title) title = $(article).find('a').attr('title') || '';

      const thumbnail = $(article).find('img.video-main-thumb').attr('src') || '';
      const duration = $(article).find('span.duration').text().replace(/[\n\r]+|^\s+|\s+$|<[^>]*>/g, '').trim();
      const hd = $(article).find('span.hd-video').length > 0;
      const link = $(article).find('a').attr('href') || '';
      
      // Ambil kategori dari class CSS
      const categoryLabel = $(article).attr('class')?.match(/category-([a-z-]+)/)?.[1] || 'Search Result';

      if (id && title && thumbnail && link) {
        videos.push({
          id, title, thumbnail, duration, hd, link, category: categoryLabel
        });
      }
    });

    // 3. Parsing Pagination
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

    const hasNext = $('.pagination a:contains("Next")').length > 0;
    const hasPrev = $('.pagination a:contains("Previous")').length > 0 || currentPage > 1;

    res.status(200).json({
      searchQuery: q,
      videos,
      currentPage,
      totalPages,
      nextPageUrl: hasNext ? 'yes' : null,
      prevPageUrl: hasPrev ? 'yes' : null,
      filters
    });

  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Failed to fetch search data' });
  }
}