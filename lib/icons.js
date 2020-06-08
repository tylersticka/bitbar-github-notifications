const octicons = require("@primer/octicons");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const cachePath = path.join(__dirname, "../cache/icons.json");

async function buildIcon(name) {
  const octicon = octicons[name];
  const svgString = octicon.toSVG({ width: 32, height: 32 });
  const svgBuffer = Buffer.from(svgString);
  const imageBuffer = await sharp(svgBuffer)
    .tiff({
      compression: "lzw",
      xres: 6,
      yres: 6,
    })
    .toBuffer();
  const base64 = imageBuffer.toString("base64");
  return base64;
}

async function buildIcons() {
  const names = Object.keys(octicons);
  const result = {};
  await Promise.all(
    names.map(async (name) => {
      const base64 = await buildIcon(name);
      result[name] = base64;
    })
  );
  return result;
}

async function getIcons() {
  try {
    const data = await fs.promises.readFile(cachePath);
    return JSON.parse(data);
  } catch {
    const icons = await buildIcons();
    await fs.promises.writeFile(cachePath, JSON.stringify(icons));
    return icons;
  }
}

module.exports = { getIcons };
