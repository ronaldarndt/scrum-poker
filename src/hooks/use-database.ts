import { onValue, type DatabaseReference } from "firebase/database";
import { useEffect, useState } from "react";

interface Options<T> {
  initialData?: T;
}

export default function useDatabase<T>(
  ref: DatabaseReference,
  options?: Options<T>,
) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | undefined>(options?.initialData);

  useEffect(() => {
    const unsub = onValue(ref, (snapshot) => {
      setLoading(false);

      if (snapshot.exists()) {
        setData(snapshot.val() as T);
      } else {
        setData(undefined);
      }
    });

    return () => {
      unsub();
    };
  }, [ref.key]);

  return [data, loading] as const;
}
