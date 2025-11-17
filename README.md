# Etsy Product Creation Tool (EPCT)

EPCT is a CLI tool designed to streamline the process of creating digital image products for Etsy stores. With EPCT, users can easily generate high-quality digital poster descriptions and mockup specifications using Gemini AI.

## Features
- **Interactive CLI**: User-friendly command-line interface with clear menus
- **Poster Generation**: Create detailed poster design specifications using AI prompts
- **Mockup Generation**: Generate mockup descriptions for your digital products
- **Local Storage**: All generated content saved locally for later use

## Prerequisites

- Node.js (v18 or higher)
- npm
- A Gemini API key from Google AI Studio

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd etsy-product-creation-tool
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

## Usage

### Running the CLI

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### CLI Features

The CLI provides an interactive menu with the following options:

1. **Generate a new poster**
   - Enter a description of your desired poster
   - AI generates a detailed design specification
   - Poster is saved locally for later use

2. **Generate mockup from poster**
   - Select from previously generated posters
   - Describe the mockup scene/prop (e.g., "framed on a white wall")
   - AI generates a detailed mockup specification

3. **View all posters**
   - List all generated posters with details

4. **View all mockups**
   - List all generated mockups with details

## Example Workflow

1. Start the CLI: `npm run dev`
2. Select "Generate a new poster"
3. Enter prompt: "Minimalist motivational poster with mountain scenery"
4. Wait for AI to generate the poster design
5. Select "Generate mockup from poster"
6. Choose your newly created poster from the list
7. Enter mockup scene: "framed on a white wall in a modern living room"
8. AI generates the mockup specification

## Development

### Running Tests

```bash
npm test        # Run tests in watch mode
npm run test:run  # Run tests once
```

### Linting and Formatting

```bash
npm run lint          # Check for linting errors
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

### Building

```bash
npm run build  # Compile TypeScript to JavaScript
```

## Project Structure

```
etsy-product-creation-tool/
├── src/
│   ├── cli.ts                    # Main CLI interface
│   ├── index.ts                  # Application entry point
│   ├── services/
│   │   ├── gemini.service.ts     # Gemini AI integration
│   │   └── storage.service.ts    # Local file storage
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── output/
│   ├── posters/                  # Generated posters
│   │   └── metadata.json         # Poster metadata
│   └── mockups/                  # Generated mockups
│       └── metadata.json         # Mockup metadata
└── tests/                        # Test files
```

## How It Works

1. **Poster Generation**:
   - User provides a text description
   - Gemini AI generates a detailed design specification
   - Specification includes layout, colors, typography, visual elements
   - Saved locally with metadata

2. **Mockup Generation**:
   - User selects a previously generated poster
   - User describes the mockup scene/setting
   - Gemini AI generates mockup specification
   - Includes details about presentation, lighting, perspective
   - Saved locally with reference to original poster

## Notes

- The tool generates text-based descriptions of posters and mockups
- These descriptions can be used with image generation tools to create actual images
- All generated content is stored in the `output/` directory
- Metadata is stored in JSON files for easy retrieval

## License

ISC
