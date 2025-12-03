import React, { useState } from "react";

function SharePost({ title, description, url }) {
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedUrl = encodeURIComponent(url);

    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=astronautmarkus`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    };

    const [copied, setCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setCopyFailed(false);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // fallback
            try {
                const textArea = document.createElement('textarea');
                textArea.value = url;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopied(true);
                setCopyFailed(false);
                setTimeout(() => setCopied(false), 2000);
            } catch (fallbackErr) {
                setCopyFailed(true);
                setTimeout(() => setCopyFailed(false), 2000);
            }
        }
    };

    return (
        <div className="shadow p-4 bg-[#c5c1c0] mt-8">
            <h3 className="md:text-xl text-lg font-semibold mb-4 text-center playstation-fonts text-gray-800">Share this post</h3>
            <div className="flex flex-wrap gap-2 items-center justify-center">
                <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer"
                   className="px-4 py-2 bg-[#ADADAD] text-black font-semibold flex items-center gap-2 hover:bg-gray-300 transition shadow"
                   aria-label="Share on Facebook">
                    <i className="hn hn-facebook-square text-blue-700"></i>
                    Facebook
                </a>
                <a href={shareUrls.twitter} target="_blank" rel="noopener noreferrer"
                   className="px-4 py-2 bg-[#ADADAD] text-black font-semibold flex items-center gap-2 hover:bg-gray-300 transition shadow"
                   aria-label="Share on X">
                    <i className="hn hn-x"></i>
                    X
                </a>
                <a href={shareUrls.linkedin} target="_blank" rel="noopener noreferrer"
                   className="px-4 py-2 bg-[#ADADAD] text-black font-semibold flex items-center gap-2 hover:bg-gray-300 transition shadow"
                   aria-label="Share on LinkedIn">
                    <i className="hn hn-linkedin text-blue-800"></i>
                    LinkedIn
                </a>
                <a href={shareUrls.whatsapp} target="_blank" rel="noopener noreferrer"
                   className="px-4 py-2 bg-[#ADADAD] text-black font-semibold flex items-center gap-2 hover:bg-gray-300 transition shadow"
                   aria-label="Share on WhatsApp">
                    <i className="hn hn-link text-green-700"></i>
                    WhatsApp
                </a>
                <a href={shareUrls.telegram} target="_blank" rel="noopener noreferrer"
                   className="px-4 py-2 bg-[#ADADAD] text-black font-semibold flex items-center gap-2 hover:bg-gray-300 transition shadow"
                   aria-label="Share on Telegram">
                    <i className="hn hn-link text-blue-700"></i>
                    Telegram
                </a>
                <button
                    className={`px-4 py-2 bg-[#ADADAD] text-black font-semibold flex items-center gap-2 hover:bg-gray-300 transition shadow copy-link cursor-pointer${copied ? " copied" : ""}`}
                    onClick={handleCopy}
                    aria-label="Copy link to clipboard"
                >
                    {copied ? (
                        <>
                            <i className="hn hn-check"></i>Copied!
                        </>
                    ) : copyFailed ? (
                        <>
                            <i className="fas fa-times"></i>Failed
                        </>
                    ) : (
                        <>
                            <i className="hn hn-link"></i>Copy Link
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default SharePost;
