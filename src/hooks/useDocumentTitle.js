import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · Inclusive Campus` : 'Inclusive Campus';
    return () => { document.title = previous; };
  }, [title]);
}
