# PentaSign: Penpot Signature Plugin

This is a [Next.js](https://nextjs.org/) and [Firebase Studio](https://firebase.google.com/studio) project that creates a plugin for [Penpot](https://penpot.app/). The primary goal of this plugin is to provide tools for visually and cryptographically signing documents directly within the Penpot design environment.

## Features

- **Penpot Shape Renderer**: Select any shape or group of shapes on the Penpot canvas and render them as HTML/CSS in a live preview within the plugin.
- **Cryptographic Signature Generation**: Upload a PDF document and provide an identifier (SOFI/ID) to generate a unique, ephemeral signature bundle.
- **Visual Signature Pattern**: Alongside the cryptographic signature, a unique SVG pattern is generated from the document's hash, providing a visual representation of the signature.
- **Signature Verification**: An AI-powered flow using Google's Gemini model to verify the authenticity of a signed document.
- **Modern Tech Stack**: Built with Next.js, React, TypeScript, and Tailwind CSS for a modern and maintainable codebase.

## Local Development

### Prerequisites

- Node.js and npm
- A running Penpot instance (e.g., `penpot.app`)

### Running Locally

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The plugin will be available at `http://localhost:9002`.

3.  **Load the Plugin in Penpot**:
    - Open the Plugin Manager in Penpot (`Ctrl + Alt + P`).
    - In the "Development" section, install the plugin using its manifest URL:
      ```
      http://localhost:9002/penpot-plugin/manifest.json
      ```

## Deployment on a VPS

To deploy this application on your own server, follow these steps.

### 1. Prerequisites on VPS

- **Node.js**: Ensure Node.js (version 18 or later) is installed.
- **Firewall**: Make sure port 9002 (or your chosen port) is open.
- **Reverse Proxy (Recommended)**: For a production setup, it's highly recommended to use a reverse proxy like Nginx to handle HTTPS and manage traffic to the Node.js process.

### 2. Build for Production

On your VPS, after cloning your repository:

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Build the application**:
    ```bash
    npm run build
    ```
    This command compiles the Penpot plugin and creates an optimized production build of the Next.js application.

### 3. Run the Application

Once the build is complete, start the production server:

```bash
npm start
```

This will start the application on port 9002, listening on all available network interfaces (`0.0.0.0`).

### 4. Load in Penpot

The final step is to load the plugin into Penpot using your VPS's public IP address or domain name.

- In the Penpot Plugin Manager, use the public URL for your manifest:
  ```
  http://<YOUR_VPS_IP_OR_DOMAIN>:9002/penpot-plugin/manifest.json
  ```

Your plugin should now be installed and running from your own server!
