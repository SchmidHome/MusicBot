import fetch from "node-fetch";
import Vibrant from "node-vibrant";
import { ConsoleLogger } from "../lib/logger";

export const colorLogger = new ConsoleLogger("color");

export function sameColor(
  color1: [number, number, number] | undefined,
  color2: [number, number, number] | undefined
): boolean {
  if (!color1 || !color2) return false;
  return (
    color1[0] == color2[0] && color1[1] == color2[1] && color1[2] == color2[2]
  );
}
