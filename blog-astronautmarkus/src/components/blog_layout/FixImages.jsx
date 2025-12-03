import { useEffect } from "react";

export default function FixImages() {
    useEffect(() => {
        const imgs = document.querySelectorAll(".markdown-content img");
        imgs.forEach((img) => {
            img.onerror = () => {
                img.src = "/img/error-banner.png";
                img.onerror = null;
            };
        });
    }, []);
    return null;
}
