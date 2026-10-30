import * as THREE from "three";

/** Canvas-drawn signage so no font download is needed. */
export function makeSignTexture(lines: { text: string; size: number; color?: string; spacing?: number }[], w = 512, h = 256, bg = "rgba(0,0,0,0)") {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.textAlign = "center"; g.textBaseline = "middle";
  const total = lines.reduce((s, l) => s + l.size * 1.25, 0);
  let y = (h - total) / 2;
  for (const l of lines) {
    g.font = `${l.size}px "Cormorant Garamond", Georgia, serif`;
    g.fillStyle = l.color ?? "#e7c98a";
    (g as unknown as { letterSpacing: string }).letterSpacing = `${l.spacing ?? 6}px`;
    g.fillText(l.text, w / 2, y + l.size * 0.62);
    y += l.size * 1.25;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16;
  return t;
}

/** Gold diamond lattice — the green clubhouse roof and lobby feature wall in the brochure. */
export function makeLatticeTexture(bg: string, line: string) {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = bg; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = line; g.lineWidth = 5;
  for (let i = -2; i <= 2; i++) {
    g.beginPath(); g.moveTo(0, i * 128); g.lineTo(256, i * 128 + 256);
    g.moveTo(0, i * 128 + 256); g.lineTo(256, i * 128); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16;
  return t;
}
