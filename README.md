# bxl

CLI toolkit for various development related tasks.

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

### Transform Files

Transforms files from one format to another.

```bash
bxl transform [input] to [output] [options]
```

**Arguments:**

- `input` - Input directory or file (default: current directory)

**Options:**

- `-o, --output <dir>` - Output directory (default: ".")
- `-q, --quality <number>` - Quality 0-100 (default: "100")

**Examples:**

```bash
# Convert all images in current directory
bxl transform . to webp

# Convert images from a specific directory
bxl transform ./images to webp

# Convert a single image
bxl transform image.png to webp

# Convert a PDF to multiple WebP images (one per page)
bxl transform document.pdf to webp

# Specify output directory and quality
bxl transform ./images to webp -o ./webp-images -q 90

# Convert PDF with custom quality and output directory
bxl transform presentation.pdf to webp -o ./slides -q 85
```

### Generate Files

Generate placeholder images with specific dimensions based on the filename pattern:

```bash
bxl generate <filename>
```

**Arguments:**

- `filename` - Filename with dimensions in the format `name_{width}x{height}.ext`

**Supported formats:**

- PNG (.png)
- JPEG (.jpg, .jpeg)
- WebP (.webp)

**Examples:**

```bash
# Generate a 300x200 PNG placeholder image
bxl generate placeholder_300x200.png

# Generate a 400x300 JPEG placeholder image
bxl generate banner_400x300.jpg

# Generate a 150x150 WebP square image
bxl generate avatar_150x150.webp

# Generate multiple placeholder images
bxl generate hero_1920x1080.png
bxl generate thumbnail_200x200.webp
bxl generate logo_500x200.png
```

**Aliases:**

- `bxl gen <filename>`
- `bxl g <filename>`

The generated images are placeholder graphics with a light gray background that display their dimensions as text in the center. This is useful for creating mockup images during development or testing when you need images of specific sizes.

### Fetch Files

Download a file from a URL to the current directory:

```bash
bxl fetch <url>
```

**Arguments:**

- `url` - URL of the file to download

**Options:**

- `-o, --output <filename>` - Custom output filename

**Examples:**

```bash
# Download a file from a URL (filename will be derived from URL)
bxl fetch https://example.com/image.jpg

# Download a file with a custom filename
bxl fetch https://example.com/image.jpg -o myimage.jpg

# Download any file type
bxl fetch https://example.com/document.pdf -o document.pdf
```

The command automatically determines the filename from the URL if not specified. If the URL doesn't contain a filename, a default name will be used.

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

- `pattern` - Naming pattern with placeholders:
  - `{index}` - Sequential numbering
  - `{width}` - Image width in pixels (images only)
  - `{height}` - Image height in pixels (images only)

**Examples:**

```bash
# Rename all files to model_1, model_2, model_3 (preserving extensions)
bxl rename . to "model_{index}"

# Rename all files to image_1.jpg, image_2.jpg, etc. (with specific extension)
bxl rename . to "image_{index}.jpg"

# Rename files to document_1, document_2, etc.
bxl rename . to "document_{index}"

# Rename images with dimensions: model_1_100x200.png, model_2_300x150.png, etc.
bxl rename . to "model_{index}_{width}x{height}"

# Rename images with only dimensions: photo_800x600.png, photo_1920x1080.jpg, etc.
bxl rename . to "photo_{width}x{height}"
```

Files are renamed in alphabetical order. If the pattern doesn't include an extension, the original file extensions are preserved.

**Note:** When using `{width}` or `{height}` placeholders, only image files will be renamed. Non-image files will be skipped with a warning message.

## Supported Image Formats

The tool supports conversion from the following formats:

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- TIFF (.tiff, .tif)
- BMP (.bmp)
- SVG (.svg)
- WebP (.webp)
- PDF (.pdf) - converts each page to a separate image

## License

MIT
