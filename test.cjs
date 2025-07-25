const fs = require("fs");
const sharp = require("sharp");
const { createGif, readGif } = require("./index.cjs");

if (!fs.existsSync("./output")) fs.mkdirSync("./output");

async function simpleUseCase() {
  const image = await createGif()
    .addFrame([
      sharp("./frames/0000.png"),
      sharp("./frames/0001.png"),
      sharp("./frames/0002.png"),
    ])
    .toSharp();
  image.toFile("./output/frames.gif");
}

async function traceEncodingProgress() {
  const now = Date.now();
  const image = await createGif({ delay: 50 })
    .addFrame(
      fs.readdirSync("./frames").map((file) => sharp(`./frames/${file}`))
    )
    .toSharp(({ total, encoded }) => {
      console.log(`${encoded}/${total}`);
    });
  console.log(Date.now() - now);
  image.toFile("./output/frames.gif");
  image.toFile("./output/frames.webp");
}

async function concatAnimatedGIFs() {
  const image = await createGif({
    transparent: "#FFFFFF",
  })
    .addFrame([
      sharp("./1.gif", { animated: true }),
      sharp("./2.gif", { animated: true }),
      sharp("./3.gif", { animated: true }),
    ])
    .toSharp();
  image.toFile("./output/concat.gif");
}

async function testReadGif() {
  const reader = readGif(sharp("./2.gif", { animated: true }));
  const frames = await reader.toFrames();
  frames.forEach((frame, index) => {
    frame.toFile(`./output/${("000" + index).substr(-4)}.png`);
  });

  const gif = await reader.toGif({
    transparent: "#FFFFFF",
  });
  const image = await gif.toSharp();
  image.toFile("./output/remake.gif");
}

// simpleUseCase();
traceEncodingProgress();
concatAnimatedGIFs();
testReadGif(); 