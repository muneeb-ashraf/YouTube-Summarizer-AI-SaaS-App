import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getCoinsFromAmount = (amount: number): number => {
  switch (amount) {
    case 49:
      return 100;
    case 79:
      return 510;
    case 99:
      return 1020;
    default:
      return 0;
  }
};