const octicons = require("@primer/octicons");
const sharp = require("sharp");
const fs = require("fs");

async function bitbarOcticon(name) {
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

async function bitbarOcticons() {
  const names = Object.keys(octicons);
  const result = {};
  await Promise.all(
    names.map(async (name) => {
      const base64 = await bitbarOcticon(name);
      result[name] = base64;
    })
  );
  return result;
}

async function cacheBitbarOcticons(file) {
  const icons = await bitbarOcticons();
  const json = JSON.stringify(icons);
  fs.writeFileSync(file, json);
}

cacheBitbarOcticons("./icons.json");
