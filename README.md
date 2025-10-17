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

### Add Dimensions to Image Filenames

Add image dimensions to filenames:

```bash
bxl transform images add dimensions [input]
```

**Arguments:**

- `input` - Input directory or file (default: current directory)

**Examples:**

```bash
# Add dimensions to all images in current directory
bxl transform images add dimensions

# Add dimensions to images in a specific directory
bxl transform images add dimensions ./images

# Add dimensions to a single image
bxl transform images add dimensions image.jpg
```

This command creates new files with dimensions added to the filename (e.g., `image.jpg` becomes `image_100x100.jpg`). Original files are preserved.

### Remove Files

Remove files matching a pattern in the current directory:

```bash
bxl remove <pattern>
```

**Arguments:**

- `pattern` - File pattern to match (e.g., "_.png", "test_.txt")

**Examples:**

```bash
# Remove all PNG files in current directory
bxl remove "*.png"

# Remove all JPG files
bxl remove "*.jpg"

# Remove files starting with 'test' and ending with .txt
bxl remove "test*.txt"
```

### Rename Files

Rename files in the current directory using a pattern:

```bash
bxl rename to <pattern>
```

**Arguments:**

- `pattern` - Naming pattern with `{index}` placeholder for sequential numbering

**Examples:**

```bash
# Rename all files to model_1, model_2, model_3 (preserving extensions)
bxl rename to "model_{index}"

# Rename all files to image_1.jpg, image_2.jpg, etc. (with specific extension)
bxl rename to "image_{index}.jpg"

# Rename files to document_1, document_2, etc.
bxl rename to "document_{index}"
```

Files are renamed in alphabetical order. If the pattern doesn't include an extension, the original file extensions are preserved.

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
