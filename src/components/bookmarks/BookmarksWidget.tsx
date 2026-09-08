import React, { useState } from 'react';
import { BookmarksConfig, QuickLink } from '../../types';
import { useBookmarks } from '../../hooks/useBookmarks';
import {
  Plus, X, Folder, ExternalLink, Globe, Trash2, Edit2,
  Youtube, Github, Twitter, Instagram, Linkedin, Facebook,
  Mail, Search, ShoppingCart, Music, Video, Code2, Database,
  BookOpen, Newspaper, MessageSquare, Cloud, Gamepad2, Briefcase,
  Camera, Map, Home, Star, Zap, Heart, Coffee, Tv
} from 'lucide-react';

interface BookmarksWidgetProps {
  config: BookmarksConfig;
  quickLinks: QuickLink[];
  onAddQuickLink: (link: Omit<QuickLink, 'id'>) => void;
  onDeleteQuickLink: (id: string) => void;
  onUpdateQuickLink: (link: QuickLink) => void;
}

// Map of domain keywords -> { icon component, gradient colors }
const SITE_ICON_MAP: Record<string, { icon: React.ElementType; gradient: string }> = {
  youtube: { icon: Youtube, gradient: 'from-red-500 to-red-700' },
  github: { icon: Github, gradient: 'from-gray-600 to-gray-900' },
  twitter: { icon: Twitter, gradient: 'from-sky-400 to-blue-600' },
  x: { icon: Twitter, gradient: 'from-sky-400 to-blue-600' },
  instagram: { icon: Instagram, gradient: 'from-pink-500 via-purple-500 to-orange-400' },
  linkedin: { icon: Linkedin, gradient: 'from-blue-600 to-blue-800' },
  facebook: { icon: Facebook, gradient: 'from-blue-500 to-blue-700' },
  gmail: { icon: Mail, gradient: 'from-red-400 to-orange-500' },
  mail: { icon: Mail, gradient: 'from-red-400 to-orange-500' },
  google: { icon: Search, gradient: 'from-blue-400 via-yellow-400 to-red-400' },
  amazon: { icon: ShoppingCart, gradient: 'from-orange-400 to-yellow-500' },
  spotify: { icon: Music, gradient: 'from-green-500 to-emerald-700' },
  netflix: { icon: Tv, gradient: 'from-red-600 to-red-900' },
  twitch: { icon: Video, gradient: 'from-purple-500 to-violet-700' },
  reddit: { icon: MessageSquare, gradient: 'from-orange-500 to-red-600' },
  discord: { icon: MessageSquare, gradient: 'from-indigo-500 to-violet-600' },
  slack: { icon: MessageSquare, gradient: 'from-pink-400 to-purple-500' },
  notion: { icon: BookOpen, gradient: 'from-gray-700 to-gray-900' },
  medium: { icon: Newspaper, gradient: 'from-green-600 to-teal-700' },
  stackoverflow: { icon: Code2, gradient: 'from-orange-500 to-amber-600' },
  vercel: { icon: Zap, gradient: 'from-gray-800 to-black' },
  figma: { icon: Star, gradient: 'from-pink-500 via-purple-500 to-blue-500' },
  dropbox: { icon: Cloud, gradient: 'from-blue-500 to-blue-700' },
  drive: { icon: Cloud, gradient: 'from-blue-400 via-green-400 to-yellow-400' },
  maps: { icon: Map, gradient: 'from-green-400 to-blue-500' },
  steam: { icon: Gamepad2, gradient: 'from-blue-700 to-gray-900' },
  epic: { icon: Gamepad2, gradient: 'from-gray-600 to-blue-800' },
  jira: { icon: Briefcase, gradient: 'from-blue-500 to-blue-700' },
  trello: { icon: Briefcase, gradient: 'from-blue-400 to-teal-500' },
  unsplash: { icon: Camera, gradient: 'from-gray-700 to-gray-900' },
  pinterest: { icon: Heart, gradient: 'from-red-500 to-red-700' },
  producthunt: { icon: Star, gradient: 'from-orange-400 to-red-500' },
  devto: { icon: Code2, gradient: 'from-gray-800 to-gray-600' },
  hashnode: { icon: Code2, gradient: 'from-blue-600 to-indigo-700' },
};

// Palette for unknown sites — cycles based on link id
const FALLBACK_GRADIENTS = [
  'from-violet-500 to-purple-700',
  'from-cyan-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-pink-500 to-rose-600',
  'from-amber-400 to-orange-600',
  'from-sky-400 to-indigo-600',
  'from-fuchsia-500 to-pink-700',
  'from-lime-400 to-green-600',
];

function getSiteInfo(url: string, id: string): { icon: React.ElementType; gradient: string } {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    for (const [keyword, info] of Object.entries(SITE_ICON_MAP)) {
      if (hostname.includes(keyword)) return info;
    }
  } catch {
    // ignore
  }
  // Deterministic fallback gradient based on id
  const idx = parseInt(id, 10) % FALLBACK_GRADIENTS.length || id.charCodeAt(0) % FALLBACK_GRADIENTS.length;
  return { icon: Globe, gradient: FALLBACK_GRADIENTS[Math.abs(idx) % FALLBACK_GRADIENTS.length] };
}

// A single shortcut icon card
const ShortcutIcon: React.FC<{ link: QuickLink; onEdit: (e: React.MouseEvent) => void; onDelete: (e: React.MouseEvent) => void }> = ({
  link,
  onEdit,
  onDelete,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const { icon: LucideIcon, gradient } = getSiteInfo(link.url, link.id);

  // Try favicon first; if it fails, show the lucide icon
  let faviconUrl = '';
  try {
    const domain = new URL(link.url).hostname;
    faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    // leave empty
  }

  const showFavicon = !imgFailed && !!faviconUrl;

  return (
    <div className="group relative">
      <a
        href={link.url}
        className="flex flex-col items-center justify-center p-3.5 rounded-2xl glass-panel hover:bg-white/15 hover:border-white/30 hover:-translate-y-1.5 transition-all duration-300 shadow-glass"
      >
        {/* Icon Container */}
        <div
          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-2.5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
        >
          {showFavicon ? (
            <img
              src={faviconUrl}
              alt={link.title}
              className="w-6 h-6 object-contain"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <LucideIcon className="w-5 h-5 text-white drop-shadow" strokeWidth={2} />
          )}
          {/* Subtle shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20 rounded-2xl pointer-events-none" />
        </div>

        <span className="text-xs font-medium text-white/90 truncate max-w-full text-center group-hover:text-white leading-tight">
          {link.title}
        </span>
      </a>

      {/* Edit & Delete Hover Actions */}
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg">
        <button
          onClick={onEdit}
          className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded"
          title="Edit"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const BookmarksWidget: React.FC<BookmarksWidgetProps> = ({
  config,
  quickLinks,
  onAddQuickLink,
  onDeleteQuickLink,
  onUpdateQuickLink,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'chrome'>('quick');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);

  const { chromeBookmarks, loading } = useBookmarks(config.mode, quickLinks);

  if (!config.enabled) return null;

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (editingLink) {
      onUpdateQuickLink({
        ...editingLink,
        title: newTitle.trim(),
        url: formattedUrl,
      });
    } else {
      onAddQuickLink({
        title: newTitle.trim(),
        url: formattedUrl,
      });
    }

    setNewTitle('');
    setNewUrl('');
    setEditingLink(null);
    setIsAddModalOpen(false);
  };

  const openEditModal = (link: QuickLink, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingLink(link);
    setNewTitle(link.title);
    setNewUrl(link.url);
    setIsAddModalOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 z-10">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'quick' ? 'bg-white/20 text-white shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Quick Launch
          </button>
          <button
            onClick={() => setActiveTab('chrome')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'chrome' ? 'bg-white/20 text-white shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Chrome Bookmarks
          </button>
        </div>

        {activeTab === 'quick' && (
          <button
            onClick={() => {
              setEditingLink(null);
              setNewTitle('');
              setNewUrl('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl backdrop-blur-md transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        )}
      </div>

      {/* QUICK LAUNCH GRID */}
      {activeTab === 'quick' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {quickLinks.map((link) => (
            <ShortcutIcon
              key={link.id}
              link={link}
              onEdit={(e) => openEditModal(link, e)}
              onDelete={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteQuickLink(link.id);
              }}
            />
          ))}
        </div>
      )}

      {/* CHROME BOOKMARKS TREE */}
      {activeTab === 'chrome' && (
        <div className="glass-panel rounded-2xl p-4 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="text-center py-6 text-white/60 text-sm">Loading Chrome bookmarks...</div>
          ) : chromeBookmarks.length === 0 ? (
            <div className="text-center py-6 text-white/60 text-sm">
              No bookmarks found or permission disabled.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {chromeBookmarks.map((node) => (
                <a
                  key={node.id}
                  href={node.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all text-white/90 hover:text-white"
                >
                  {node.children ? (
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-accent shrink-0" />
                  )}
                  <span className="text-xs truncate">{node.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT LINK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingLink ? 'Edit Shortcut' : 'Add New Shortcut'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. GitHub"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-white/10 border border-white/15 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">URL</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://github.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-white/10 border border-white/15 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-black bg-accent hover:bg-accent/90 rounded-xl shadow-glow transition-all"
                >
                  Save Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
