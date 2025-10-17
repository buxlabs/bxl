# bxl

CLI toolkit for various transformation operations.

## Installation

```bash
npm install -g bxl
```

Or for development:

```bash
npm install
npm link
```

## Usage

### Transform Images to WebP

Convert images to WebP format:

```bash
bxl transform images to webp [input] [options]
```

**Arguments:**

- `input` - Input directory or file (default: current directory)

**Options:**

- `-o, --output <dir>` - Output directory (default: ".")
- `-q, --quality <number>` - Quality 0-100 (default: "100")

**Examples:**

```bash
# Convert all images in current directory
bxl transform images to webp

# Convert images from a specific directory
bxl transform images to webp ./images

# Convert a single image
bxl transform images to webp image.png

# Specify output directory and quality
bxl transform images to webp ./images -o ./webp-images -q 90
```

## Supported Image Formats

The tool supports conversion from the following formats:

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- TIFF (.tiff, .tif)
- BMP (.bmp)
- SVG (.svg)
- WebP (.webp)

## License

MIT
