import { useState, useEffect } from 'react';
import { QuickLink } from '../types';

export interface ChromeBookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: ChromeBookmarkNode[];
}

export interface TopSiteNode {
  title: string;
  url: string;
}

const MOCK_TOP_SITES: TopSiteNode[] = [
  { title: 'Google', url: 'https://www.google.com' },
  { title: 'YouTube', url: 'https://www.youtube.com' },
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'Reddit', url: 'https://www.reddit.com' },
  { title: 'X (Twitter)', url: 'https://x.com' },
  { title: 'Wikipedia', url: 'https://www.wikipedia.org' },
];

export function useBookmarks(mode: 'custom' | 'chrome', defaultQuickLinks: QuickLink[]) {
  const [chromeBookmarks, setChromeBookmarks] = useState<ChromeBookmarkNode[]>([]);
  const [topSites, setTopSites] = useState<TopSiteNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  // Unconditionally fetch topSites on mount
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.topSites) {
      try {
        chrome.topSites.get((sites) => {
          if (typeof chrome !== 'undefined' && chrome.runtime?.lastError) {
            console.error('topSites error:', chrome.runtime.lastError);
            setTopSites(MOCK_TOP_SITES);
            return;
          }
          if (sites && Array.isArray(sites) && sites.length > 0) {
            setTopSites(
              sites.map((s) => ({
                url: s.url,
                title: s.title || (s.url ? new URL(s.url).hostname : 'Link'),
              }))
            );
          } else {
            setTopSites(MOCK_TOP_SITES);
          }
        });
      } catch (err) {
        console.warn('Chrome topSites API call failed', err);
        setTopSites(MOCK_TOP_SITES);
      }
    } else {
      setTopSites(MOCK_TOP_SITES);
    }
  }, []);

  // Fetch Chrome bookmarks tree unconditionally so they're available
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      setLoading(true);
      try {
        chrome.bookmarks.getTree((nodes) => {
          if (typeof chrome !== 'undefined' && chrome.runtime?.lastError) {
            console.warn('Chrome bookmarks permission/error', chrome.runtime.lastError);
            setHasPermission(false);
            setLoading(false);
            return;
          }
          if (nodes && nodes.length > 0) {
            // Flatten or return primary bookmarks bar (id "1")
            const bar = nodes[0].children ? nodes[0].children.find((c) => c.id === '1') || nodes[0] : nodes[0];
            setChromeBookmarks(bar.children || []);
          }
          setLoading(false);
        });
      } catch (err) {
        console.warn('Chrome bookmarks exception', err);
        setHasPermission(false);
        setLoading(false);
      }
    }
  }, []);

  return { chromeBookmarks, topSites, loading, hasPermission };
}
