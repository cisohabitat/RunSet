import { useEffect, useState } from "react";
import {
  decodeRackOrder,
  rackOrderKey,
  type RackOrder,
} from "../lib/rackOrder";
export function useRackOrder() {
  const [order, setOrder] = useState(() => {
    try {
      return decodeRackOrder(localStorage.getItem(rackOrderKey));
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key === rackOrderKey || event.key === null)
        setOrder(decodeRackOrder(event.newValue));
    };
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, []);
  const remember = (value: RackOrder) => {
    setOrder(value);
    try {
      localStorage.setItem(rackOrderKey, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };
  return [order, remember] as const;
}
