"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/CopyButton";

export default function MetaTagGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [ogType, setOgType] = useState("website");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [siteName, setSiteName] = useState("");
  const [url, setUrl] = useState("");

  const metaTags = useMemo(() => {
    const tags: string[] = [];

    if (title) {
      tags.push(`<title>${title}</title>`);
      tags.push(`<meta name="title" content="${title}" />`);
      tags.push(`<meta property="og:title" content="${title}" />`);
      tags.push(`<meta name="twitter:title" content="${title}" />`);
    }

    if (description) {
      tags.push(`<meta name="description" content="${description}" />`);
      tags.push(`<meta property="og:description" content="${description}" />`);
      tags.push(`<meta name="twitter:description" content="${description}" />`);
    }

    if (keywords) {
      tags.push(`<meta name="keywords" content="${keywords}" />`);
    }

    if (author) {
      tags.push(`<meta name="author" content="${author}" />`);
    }

    tags.push(`<meta property="og:type" content="${ogType}" />`);

    if (url) {
      tags.push(`<meta property="og:url" content="${url}" />`);
      tags.push(`<link rel="canonical" href="${url}" />`);
    }

    if (siteName) {
      tags.push(`<meta property="og:site_name" content="${siteName}" />`);
    }

    if (ogImage) {
      tags.push(`<meta property="og:image" content="${ogImage}" />`);
      tags.push(`<meta name="twitter:image" content="${ogImage}" />`);
    }

    tags.push(`<meta name="twitter:card" content="${twitterCard}" />`);
    tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`);
    tags.push(`<meta charset="UTF-8" />`);

    return tags.join("\n");
  }, [title, description, keywords, author, ogImage, ogType, twitterCard, siteName, url]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-4">Meta Tag Fields</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Title
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Page Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Author
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Author Name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Description
            </label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="Page description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Keywords (comma separated)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="keyword1, keyword2, keyword3"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Site Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="My Website"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              URL
            </label>
            <input
              type="url"
              className="input-field"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              OG Image URL
            </label>
            <input
              type="url"
              className="input-field"
              placeholder="https://example.com/image.jpg"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              OG Type
            </label>
            <select
              className="input-field"
              value={ogType}
              onChange={(e) => setOgType(e.target.value)}
            >
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="book">book</option>
              <option value="profile">profile</option>
              <option value="music.song">music.song</option>
              <option value="video.movie">video.movie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Twitter Card
            </label>
            <select
              className="input-field"
              value={twitterCard}
              onChange={(e) => setTwitterCard(e.target.value)}
            >
              <option value="summary">summary</option>
              <option value="summary_large_image">summary_large_image</option>
              <option value="app">app</option>
              <option value="player">player</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300">Generated Meta Tags</h3>
          <CopyButton text={metaTags} />
        </div>
        <pre className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800 text-sm font-mono text-surface-800 dark:text-surface-200 overflow-x-auto whitespace-pre-wrap">
          {metaTags}
        </pre>
      </div>
    </div>
  );
}
