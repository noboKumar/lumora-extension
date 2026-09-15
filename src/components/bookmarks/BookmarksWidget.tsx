import React, { useState, useMemo, useEffect } from "react";
import { BookmarksConfig, QuickLink } from "../../types";
import { useBookmarks, TopSiteNode } from "../../hooks/useBookmarks";
import {
  Plus,
  X,
  Folder,
  ExternalLink,
  Trash2,
  Edit2,
  Flame,
  BookmarkCheck,
  Star,
} from "lucide-react";

interface BookmarksWidgetProps {
  config: BookmarksConfig;
  quickLinks: QuickLink[];
  onAddQuickLink: (link: Omit<QuickLink, "id">) => void;
  onDeleteQuickLink: (id: string) => void;
  onUpdateQuickLink: (link: QuickLink) => void;
}

// Component to dynamically render site favicon using Chrome's official favicon endpoint + MV3 + DDG
const SiteFavicon: React.FC<{
  url: string;
  title: string;
  className?: string;
  containerClassName?: string;
}> = ({
  url,
  title,
  className = "w-6 h-6",
  containerClassName = "w-12 h-12",
}) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const { sources, initial } = useMemo(() => {
    let formattedUrl = (url || "").trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let dom = "";
    let init = title ? title.charAt(0).toUpperCase() : "?";

    try {
      if (formattedUrl) {
        const parsed = new URL(formattedUrl);
        dom = parsed.hostname.replace(/^www\./, "");
        if (dom.charAt(0)) {
          init = dom.charAt(0).toUpperCase();
        }
      }
    } catch {
      // ignore
    }

    const srcList: string[] = [];

    // 1. Chrome's native favicon cache (fastest, most accurate, no external request)
    if (typeof chrome !== "undefined" && chrome.runtime?.id && formattedUrl) {
      try {
        srcList.push(
          `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(formattedUrl)}&size=64`,
        );
      } catch {
        // ignore
      }
    }

    // 2. Google Favicon V2 (external fallback for sites Chrome hasn't visited/cached)
    if (formattedUrl) {
      srcList.push(
        `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(formattedUrl)}&size=64`,
      );
    }

    // 3. DuckDuckGo
    if (dom) {
      srcList.push(`https://icons.duckduckgo.com/ip3/${dom}.ico`);
    }

    // 4. Google s2
    if (dom) {
      srcList.push(`https://www.google.com/s2/favicons?domain=${dom}&sz=64`);
    }

    // 5. Direct favicon.ico
    if (dom) {
      srcList.push(`https://${dom}/favicon.ico`);
    }

    return { sources: srcList, initial: init };
  }, [url, title]);

  useEffect(() => {
    setSourceIndex(0);
    setHasError(false);
  }, [url]);

  const handleImageError = () => {
    if (sourceIndex + 1 < sources.length) {
      setSourceIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className={`${containerClassName} rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center shadow-md relative overflow-hidden group-hover:scale-110 group-hover:border-white/30 group-hover:shadow-glow transition-all duration-300 shrink-0`}
    >
      {!hasError && sources.length > 0 ? (
        <img
          src={sources[sourceIndex]}
          alt={title}
          className={`${className} object-contain rounded select-none pointer-events-none`}
          onError={handleImageError}
        />
      ) : (
        <span className="font-bold text-white/90 text-sm select-none">
          {initial}
        </span>
      )}
    </div>
  );
};

// Quick Link Shortcut Icon Component using Website Favicon
const ShortcutIcon: React.FC<{
  link: QuickLink;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}> = ({ link, onEdit, onDelete }) => {
  return (
    <div className="group relative">
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center justify-center p-3.5 rounded-2xl glass-panel hover:bg-white/15 hover:border-white/30 hover:-translate-y-1.5 transition-all duration-300 shadow-glass"
      >
        <SiteFavicon
          url={link.url}
          title={link.title}
          className="w-6 h-6"
          containerClassName="w-12 h-12 mb-2.5"
        />

        <span className="text-xs font-medium text-white/90 truncate max-w-full text-center group-hover:text-white leading-tight">
          {link.title}
        </span>
      </a>

      {/* Edit & Delete Hover Actions */}
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-lg">
        <button
          onClick={onEdit}
          className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded transition-colors"
          title="Edit"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
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
  const [activeTab, setActiveTab] = useState<"quick" | "bookmarks">("quick");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);

  const { chromeBookmarks, topSites, loading } = useBookmarks(
    config.mode,
    quickLinks,
  );

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

    setNewTitle("");
    setNewUrl("");
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
    <div className="w-full max-w-4xl mx-auto my-2.5 z-10">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("quick")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "quick"
                ? "bg-white/20 text-white shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>Quick Launch</span>
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "bookmarks"
                ? "bg-white/20 text-white shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>Bookmarks</span>
            {topSites.length > 0 && (
              <span
                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                title="Most used links active"
              />
            )}
          </button>
        </div>

        <button
          onClick={() => {
            setEditingLink(null);
            setNewTitle("");
            setNewUrl("");
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl backdrop-blur-md transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Bookmark</span>
        </button>
      </div>

      {/* QUICK LAUNCH TAB VIEW */}
      {activeTab === "quick" && (
        <div className="space-y-5">
          {/* Section A: Custom Shortcuts */}
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

          {/* Section B: Most Used Links */}
          {topSites.length > 0 && (
            <div className="glass-panel rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/90 border-b border-white/10 pb-2">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Most Used Links</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {topSites.slice(0, 6).map((site: TopSiteNode, idx: number) => (
                  <a
                    key={idx}
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 transition-all text-white/90 hover:text-white group"
                  >
                    <SiteFavicon
                      url={site.url}
                      title={site.title}
                      className="w-5 h-5"
                      containerClassName="w-9 h-9 mb-2"
                    />
                    <span className="text-[11px] font-medium truncate max-w-full text-center leading-tight">
                      {site.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOOKMARKS TAB VIEW */}
      {activeTab === "bookmarks" && (
        <div className="glass-panel rounded-2xl p-4 space-y-5 max-h-[420px] overflow-y-auto">
          {/* SECTION 1: CUSTOM BOOKMARKS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white/90 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Custom Bookmarks</span>
              </div>
              <span className="text-[10px] text-white/50">
                {quickLinks.length} items
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
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
          </div>

          {/* SECTION 2: CHROME BOOKMARKS BAR */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white/90 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-sky-400" />
                <span>Chrome Bookmarks Bar</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-6 text-white/60 text-sm">
                Loading Chrome bookmarks...
              </div>
            ) : chromeBookmarks.length === 0 ? (
              <div className="text-center py-6 text-white/60 text-sm">
                No bookmarks found or Chrome bookmarks permission is not
                granted.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {chromeBookmarks.map((node) => (
                  <a
                    key={node.id}
                    href={node.url || "#"}
                    target={node.url ? "_blank" : "_self"}
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/20 transition-all text-white/90 hover:text-white group"
                  >
                    {node.children ? (
                      <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                        <Folder className="w-4 h-4 text-amber-400" />
                      </div>
                    ) : node.url ? (
                      <SiteFavicon
                        url={node.url}
                        title={node.title}
                        className="w-4 h-4"
                        containerClassName="w-7 h-7"
                      />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-accent shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">
                        {node.title}
                      </div>
                      {node.url && (
                        <div className="text-[10px] text-white/40 truncate">
                          {new URL(
                            node.url.startsWith("http")
                              ? node.url
                              : `https://${node.url}`,
                          ).hostname.replace(/^www\./, "")}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: MOST USED LINKS */}
          {topSites.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/90 border-b border-white/10 pb-2">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Most Used Links</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {topSites.slice(0, 6).map((site: TopSiteNode, idx: number) => (
                  <a
                    key={idx}
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 transition-all text-white/90 hover:text-white group"
                  >
                    <SiteFavicon
                      url={site.url}
                      title={site.title}
                      className="w-5 h-5"
                      containerClassName="w-9 h-9 mb-2"
                    />
                    <span className="text-[11px] font-medium truncate max-w-full text-center leading-tight">
                      {site.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT LINK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingLink ? "Edit Shortcut" : "Add New Shortcut"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Title
                </label>
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
                <label className="block text-xs font-medium text-white/70 mb-1">
                  URL
                </label>
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
