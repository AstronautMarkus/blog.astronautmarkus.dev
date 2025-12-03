import { useEffect, useState } from "react";

export default function TOC() {
    const [headings, setHeadings] = useState([]);

    useEffect(() => {
        const elements = Array.from(
            document.querySelectorAll(".markdown-content h1, h2, h3")
        );
        const parsed = elements.map((el) => ({
            id: el.id || "",
            text: el.innerText,
            level: Number(el.tagName.replace("H", ""))
        }));
        setHeadings(parsed);
    }, []);

    return (
        <ul className="space-y-1">
            <li><a href="#" className="hover:underline text-gray-700 font-medium">Index</a></li>
            {headings.map((h, idx) => (
                <li key={idx} className={`ml-${(h.level - 1) * 2}`}>
                    <a href={`#${h.id}`} className="hover:underline text-gray-700 font-medium">
                        {h.text}
                    </a>
                </li>
            ))}
        </ul>
    );
}
