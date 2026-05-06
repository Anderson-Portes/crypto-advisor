"use client";

import { Newspaper, ExternalLink, Search } from "lucide-react";
import { useState } from "react";

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
}

interface Props {
  articles: Article[];
  loading: boolean;
  onSearch: (q: string) => void;
}

const NEWS_TOPICS = ["Bitcoin", "Ethereum", "DeFi", "NFT", "Altcoins", "Regulação"];

export default function NewsSection({ articles, loading, onSearch }: Props) {
  const [activeTopic, setActiveTopic] = useState("Bitcoin");

  function handleTopic(topic: string) {
    setActiveTopic(topic);
    onSearch(topic.toLowerCase());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-blue-400" />
          Notícias
        </h2>
        <div className="flex flex-wrap gap-2">
          {NEWS_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => handleTopic(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTopic === t
                  ? "bg-blue-500 text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-blue-500/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-glow bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden flex flex-col hover:border-blue-500/40 transition-all fade-in group"
            >
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt=""
                  className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="p-3 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-blue-400 font-medium">{article.source.name}</span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-secondary)]" />
                </div>
                <p className="text-sm font-semibold text-white line-clamp-2 mb-1">{article.title}</p>
                {article.description && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 flex-1">{article.description}</p>
                )}
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  {new Date(article.publishedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
