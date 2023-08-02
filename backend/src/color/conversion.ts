export function scaleColor(
  color: [number, number, number]
): [number, number, number] {
  const maxColorValue = Math.max(...color);
  const scaleFactor = maxColorValue > 0 ? 255 / maxColorValue : 1;

  const scaledColor = color.map((value) => value * scaleFactor) as [
    number,
    number,
    number
  ];
  return scaledColor;
}

export function roundColor(
  color: [number, number, number]
): [number, number, number] {
  const roundedColor = color.map((value) => Math.round(value)) as [
    number,
    number,
    number
  ];
  return roundedColor;
}

export function rangeColor(
  color: [number, number, number]
): [number, number, number] {
  const rangedColor = color.map((value) =>
    Math.max(0, Math.min(255, value))
  ) as [number, number, number];
  return rangedColor;
}

export function reduceColor(
  color: [number, number, number]
): [number, number, number] {
  const minColorValue = Math.min(...color);
  const reduceAmount = Math.min(minColorValue, 96);

  const reducedColor = color.map((value) =>
    Math.max(0, value - reduceAmount)
  ) as [number, number, number];
  return reducedColor;
}

export function RGBtoHSL(color: [number, number, number]): {
  hue: number;
  sat: number;
  lum: number;
} {
  const [r, g, b] = color.map((value) => value / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let saturation = 0;
  const luminance = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    saturation =
      luminance > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        hue = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        hue = (b - r) / delta + 2;
        break;
      case b:
        hue = (r - g) / delta + 4;
        break;
    }

    hue *= 60;
  }

  return {
    hue: Math.round(hue),
    sat: Math.round(saturation * 100),
    lum: Math.round(luminance * 100),
  };
}

export function HSLtoRGB(color: {
  hue: number;
  sat: number;
  lum: number;
}): [number, number, number] {
  const { hue, sat, lum } = color;
  const h = hue / 360;
  const s = sat / 100;
  const l = lum / 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
