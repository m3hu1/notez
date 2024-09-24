# NOTEZ - AI Math Solver

NOTEZ is an AI-powered math solver that allows users to draw mathematical expressions on a canvas and get instant solutions. The project leverages React, TypeScript, Vite, and FastAPI to provide a seamless and interactive experience.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)

## Features

- **Interactive Canvas**: Draw mathematical expressions directly on the canvas.
- **AI-Powered Solver**: Uses AI to analyze and solve mathematical expressions.
- **Real-time Feedback**: Get instant solutions displayed on the canvas.
- **Keyboard Shortcuts**: Use `⌘ + K` to reset the canvas and `⌘ + J` to run the solver.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Frontend

1. Clone the repository:
    ```sh
    git clone https://github.com/m3hu1/notez.git
    cd notez/frontend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm run dev
    ```

### Backend

1. Navigate to the backend directory:
    ```sh
    cd ../backend
    ```

2. Create a virtual environment and activate it:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install dependencies:
    ```sh
    pip install -r requirements.txt
    ```

4. Run the main.py file:
    ```sh
    python3 main.py
    ```

## Usage

1. Open your browser and navigate to `http://localhost:5173/`.
2. Draw a mathematical expression on the canvas.
3. Press `⌘ + J` to run the solver and see the results on the canvas.

## Project Structure

### Frontend

- **`src/main.tsx`**: Entry point for the React application.
- **`src/screens/home/index.tsx`**: Main screen where the canvas and solver logic are implemented.
- **`src/components/ui`**: Contains UI components like `CommandBox` and `CommandBoxRun`.

### Backend

- **`main.py`**: Entry point for the FastAPI application.
- **`apps/calculator/route.py`**: Contains the API route for processing images.
- **`apps/calculator/utils.py`**: Utility functions for analyzing images using AI.
- **`schema.py`**: Pydantic models for request validation.

## Configuration

### Frontend

- **Vite Configuration**: Located in `vite.config.ts`.
- **TypeScript Configuration**: Located in `tsconfig.json`.
- **Environment Variables**: Configure in `.env.local` file. Example:
    ```env
    VITE_API_URL=http://localhost:8900
    
    ```
### Backend

- **Environment Variables**: Configure in `.env` file. Example:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```
## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.
