import { useRouter } from "next/navigation";
import { DependencyList, useEffect } from "react";

export default function useGuard(
  fn: () => boolean,
  route: string,
  deps: DependencyList,
) {
  const router = useRouter();

  useEffect(() => {
    if (!fn()) {
      router.push(route);
    }
  }, deps);
}
