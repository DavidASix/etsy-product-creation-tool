# Etsy Product Creation Tool (EPCT)

EPCT is a powerful tool designed to streamline the process of creating digital image products for Etsy stores. With EPCT, users can easily generate high-quality digital posters, printable products, and the required mockup images to showcase their products effectively.

## Features
- **User-Friendly Web UI**: Beautiful web interface for generating and managing posters
- **CLI for Mockup Generation**: Command-line interface for creating product mockups
- **Automated Product Creation**: Generate digital posters through Gemini AI based on text prompts
- **Mockup Generation**: Automatically create mockup descriptions for your digital products

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
PORT=3000
```

## Usage

### Web UI (Poster Generation)

Start the web UI server to generate and manage posters:

```bash
npm run dev:ui
```

Or build and run in production mode:

```bash
npm run start:ui
```

The web UI will be available at `http://localhost:3000`

**Features:**
- Generate posters using AI prompts
- View all generated posters
- Download posters as text files

### CLI (Mockup Generation)

Run the CLI to create mockups from your generated posters:

```bash
npm run dev
```

Or build and run in production mode:

```bash
npm start
```

**Features:**
- Select from previously generated posters
- Create mockups by describing the scene/prop
- View all generated mockups

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
│   ├── cli.ts                    # CLI application entry point
│   ├── index.ts                  # Main CLI entry
│   ├── services/
│   │   ├── gemini.service.ts     # Gemini AI integration
│   │   └── storage.service.ts    # File storage management
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── ui/
│       ├── index.ts              # Web UI server entry
│       └── server.ts             # Express server setup
├── public/
│   └── index.html                # Web UI interface
├── output/
│   ├── posters/                  # Generated posters
│   └── mockups/                  # Generated mockups
└── tests/                        # Test files
```

## How It Works

1. **Poster Generation (Web UI)**:
   - User enters a description of the desired poster
   - Gemini AI generates a detailed design specification
   - The poster is saved locally and displayed in the UI
   - User can download the poster description

2. **Mockup Generation (CLI)**:
   - User selects a previously generated poster
   - User describes the mockup scene (e.g., "framed on a white wall")
   - Gemini AI generates a detailed mockup specification
   - The mockup is saved locally

## Notes

- Currently, the tool generates text-based descriptions of posters and mockups
- These descriptions can be used with image generation tools to create actual images
- All generated content is stored in the `output/` directory
- Poster and mockup metadata is stored in JSON files

## License

ISC

