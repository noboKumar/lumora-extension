import { useState, useEffect } from 'react';
import { QuickLink } from '../types';
import { isChromeExtension } from '../lib/chrome-storage';

export interface ChromeBookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: ChromeBookmarkNode[];
}

export function useBookmarks(mode: 'custom' | 'chrome', defaultQuickLinks: QuickLink[]) {
  const [chromeBookmarks, setChromeBookmarks] = useState<ChromeBookmarkNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  useEffect(() => {
    if (mode === 'chrome' && isChromeExtension() && chrome.bookmarks) {
      setLoading(true);
      try {
        chrome.bookmarks.getTree((nodes) => {
          if (nodes && nodes.length > 0) {
            // Flatten or return primary bookmarks bar
            const bar = nodes[0].children ? nodes[0].children.find((c) => c.id === '1') || nodes[0] : nodes[0];
            setChromeBookmarks(bar.children || []);
          }
          setLoading(false);
        });
      } catch (err) {
        console.warn('Chrome bookmarks permission error', err);
        setHasPermission(false);
        setLoading(false);
      }
    }
  }, [mode]);

  return { chromeBookmarks, loading, hasPermission };
}
