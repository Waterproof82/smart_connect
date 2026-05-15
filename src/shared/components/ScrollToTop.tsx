import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Strip query params (e.g. #contacto?servicio=X → #contacto)
      // to avoid invalid CSS selectors like '#contacto?servicio=X'
      const anchor = hash.includes("?") ? hash.split("?")[0] : hash;
      setTimeout(() => {
        const element = document.querySelector(anchor);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};
