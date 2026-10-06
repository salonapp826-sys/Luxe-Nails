import { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export const PublishedBanner = ({ websiteUrl }: { websiteUrl: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    toast.success('Website link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!websiteUrl) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          Website Published Live! 🚀
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Visit your live URL:{' '}
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 underline font-medium hover:text-pink-700 inline-flex items-center gap-1 break-all"
          >
            {websiteUrl}
            <ExternalLink size={14} className="shrink-0" />
          </a>
        </p>
      </div>

      {/* Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors cursor-pointer shrink-0"
      >
        {copied ? (
          <>
            <Check size={16} className="text-green-600" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={16} />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
};
