**Note:** you can try [sharp-gif2](https://www.npmjs.com/package/sharp-gif2) first, it is base on [gifenc](https://www.npmjs.com/package/gifenc), has faster encoding speed.

---

# sharp-gif

Generate animated GIF/WebP for [sharp](https://www.npmjs.com/package/sharp) base on [gif-encoder](https://www.npmjs.com/package/gif-encoder).

![](1.gif) + ![](2.gif) + ![](3.gif) = ![](output/concat.gif)

## Install

```bash
npm install sharp-gif
```

## Usage

### Generate animated GIF

```js
const fs = require("fs");
const sharp = require("sharp");
const GIF = require("sharp-gif");

(async () => {
  // Simple use case
  const image = await GIF
    .createGif()
    .addFrame([
      sharp("./frames/0000.png"),
      sharp("./frames/0001.png"),
      sharp("./frames/0002.png"),
    ])
    .toSharp();
  image.toFile("./frames.gif");
  // Can also generate an animated WebP
  image.toFile("./frames.webp");

  // Options
  const gif = GIF.createGif({
    // GifEncoder constructor options
    gifEncoderOptions: { highWaterMark: 64 },
    // Sharp constructor options
    sharpOptions: {},
    // Custom size
    width: 300,
    height: 200,
    // Amount of milliseconds to delay between frames
    delay: 200,
    // Amount of times to repeat GIF
    repeat: 0,
    // GIF quality
    quality: 10,
    // Define the color which represents transparency in the GIF.
    transparent: "#FFFFFF",
    // Resize all frame to `largest` or `smallest`
    resizeTo: "largest",
    // Resize by `zoom` or `crop`
    resizeType: "zoom",
    // Options for sharp.resize()
    resizeOptions: {},
    // Background option for sharp.extend()
    extendBackground: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  gif.addFrame(sharp("./1.png"));
  gif.addFrame(sharp("./2.png"));
  const image = await gif.toSharp();
  image.toFile("./frames.gif");

  // Trace encoding progress
  const image = await GIF
    .createGif()
    .addFrame(
      fs.readdirSync("./frames")
        .map((file) => sharp(`./frames/${file}`))
    )
    .toSharp(({ total, encoded }) => {
      console.log(`${encoded}/${total}`);
    });
  image.toFile("./frames.gif");

  // You can even concat animated GIFs
  const image = await GIF
    .createGif({ transparent: "#FFFFFF", })
    .addFrame([
      sharp("./1.gif", { animated: true }),
      sharp("./2.gif", { animated: true }),
    ])
    .toSharp();
  image.toFile("./concat.gif");
})();
```

### Processing GIF frames

```js
const sharp = require("sharp");
const GIF = require("sharp-gif");

(async () => {
  const reader = GIF.readGif(sharp("./2.gif", { animated: true }));
  const frames = await reader.toFrames();
  frames.forEach((frame, index) => {
    // You can process each frame here

    // Or just simple output frame
    frame.toFile(`./output/${("000" + index).substr(-4)}.png`);
  });

  const gif = await reader.toGif({ transparent: "#FFFFFF", });
  const image = await gif.toSharp();
  image.toFile("./output/remake.gif");
})();
```

## API

### `GIF.createGif(options?: Object): Gif`

- `options` Object _(optional)_
  - `gifEncoderOptions` Object _(optional)_ - GifEncoder constructor options.
    - `highWaterMark` Number - Number, in bytes, to store in internal buffer. Defaults to 64kB.
  - `sharpOptions` Object _(optional)_ - Sharp constructor [options](https://sharp.pixelplumbing.com/api-constructor#parameters).
  - `width` Number _(optional)_ - Width, in pixels, of the GIF to output.
  - `height` Number _(optional)_ - Height, in pixels, of the GIF to output.
  - `delay` Number _(optional)_ - Amount of milliseconds to delay between frames.
  - `repeat` Number _(optional)_ - Amount of times to repeat GIF. Default by `0`, loop indefinitely.
  - `quality` Number _(optional)_ - GIF quality. `1` is best colors and worst performance, `20` is suggested maximum but there is no limit. Default by `10`.
  - `transparent` String _(optional)_ - Define the color which represents transparency in the GIF.
  - `resizeTo` ("largest" | "smallest") _(optional)_ - Resize all frame to the `largest` frame or `smallest` frame size. Default by `largest`.
  - `resizeType` ("zoom" | "crop") _(optional)_ - `zoom` use sharp.resize(), `crop` use sharp.extend() and sharp.extract().
  - `resizeOptions` [sharp.ResizeOptions](https://sharp.pixelplumbing.com/api-resize#parameters) _(optional)_ - Options for sharp.resize().
  - `extendBackground` [sharp.Color](https://www.npmjs.org/package/color) _(optional)_ - Background option for sharp.extend().

Returns `Gif` - Return a instance of Gif Contains the following methods:

#### `gif.addFrame(frame: Sharp | Sharp[]): Gif`

- `frame` (Sharp | Sharp[]) - An instance of Sharp, or an array of instance of Sharp.

Returns `Gif` - Return the Gif instance for chaining.

#### `gif.toSharp(progress?: Function, encoder?: GifEncoder): Promise<Sharp>`

Encode all frames and resolve with an animated Sharp instance.

- `progress` (info: Object) => void _(optional)_ - Frames encoding progress.
  - `info` Object - **Note** that the frames count contains GIF header end footer (as 2 frames).
    - `total` Number - Total frames count.
    - `encoded` Number - Encoded frames count.
- `encoder` GifEncoder _(optional)_ - Custom GifEncoder.

Returns `Promise<Sharp>` - Resolve with an instance of Sharp.

#### `gif.toBuffer(progress?: Function, encoder?: GifEncoder): Promise<Buffer>`

Encode all frames and resolve with an animated GIF buffer.

#### `gif.getEncoder(width: Number, height: Number, options?: Object): GIFEncoder`

Return a new instance of GIFEncoder. See [new GifEncoder](https://github.com/twolfson/gif-encoder#new-gifencoderwidth-height-options).

### `GIF.readGif(image: Sharp): GifReader`

- `image` Sharp - An instance of Sharp

Returns `GifReader` - Return a instance of GifReader Contains the following methods:

#### `reader.toFrames(): Promise<Sharp[]>`

Cut GIF frames.

Returns `Promise<Sharp[]>` - Resolve with cutted frames (an array of instance of Sharp).

#### `reader.toGif(options?: Object): Promise<Gif>`

Create Gif from cutted frames.

- `options` Object _(optional)_ - Options for createGif(). See [createGif](#gifcreategifoptions-object-gif).

Returns `Promise<Gif>` - Resolve with an instance of Gif.

A shortcut to create a Gif with the cutted frames, equal to:

`GIF.createGif(options).addFrame(reader.frames || (await reader.toFrames()));`

## Change Log

### 0.1.3

- Feature: Add `GifReader` for cutting frames.

### 0.1.5

- Fix: Resize bug.
