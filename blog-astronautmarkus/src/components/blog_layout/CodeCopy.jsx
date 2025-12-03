import { useState } from "react";

export default function CodeCopy({ code }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button onClick={copy} className="bg-[#c5c1c0] hover:bg-gray-200 text-gray-700 px-2 py-1 text-sm ml-2 mt-1 flex items-center gap-1 transition">
            {copied ? "Copied!" : "Copy"}
        </button>
    );
}
