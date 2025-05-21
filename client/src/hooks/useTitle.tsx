import { useEffect, useRef } from "react";

interface TitleOptions {
  restoreOnUnmount?: boolean;
}

export function useTitle(title: string, options: TitleOptions = {}) {
  const { restoreOnUnmount = false } = options;
  const previousTitle = useRef(document.title);

  useEffect(() => {
    document.title = title;

    if (restoreOnUnmount) {
      return () => {
        document.title = previousTitle.current;
      };
    }
    return undefined;
  }, [title, restoreOnUnmount]);
}
