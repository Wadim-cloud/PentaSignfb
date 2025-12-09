# **App Name**: PentaSign Plugin

## Core Features:

- Manifest Generation: Generates the manifest.json file required for Penpot plugins, defining the plugin's name, permissions, and entry points.
- Signature Tool Integration: Integrates the Penpot plugin with PentaSign to provide visual and cryptographic signing functionalities within Penpot, allowing users to digitally sign documents using their cryptographic keys.
- Document Signing: Enables users to digitally sign documents within Penpot, applying visual signatures directly onto the document and creating a corresponding cryptographic signature, storing document in Firestore.
- Signature Verification: Provides a tool that lets users verify both the visual and cryptographic signatures on a signed document within Penpot, ensuring the document's integrity and authenticity using the Google Gemini API tool to make this happen, if neccessary. The tool uses reasoning to decide when it may or may not be needed to look at a file saved on Firestore to do this verification step.
- Google API Integration: Facilitates seamless integration with Google APIs, such as Google Drive and the Gemini API, for enhanced functionality, including OAuth 2.0 authentication.
- Github Push: Offers one-click transfer to Github after editing.

## Style Guidelines:

- Primary color: Soft, desaturated blue (#94B4C6), evocative of digital trust, authenticity.
- Background color: Very light gray (#F2F4F6), for a clean and professional workspace.
- Accent color: Muted red-orange (#C69572) for CTAs and important actions.
- Body and headline font: 'Inter', a sans-serif with a modern, machined, objective, neutral look, suitable for both headlines and body text.
- Use clean, minimalist icons to represent actions such as signing, verifying, and exporting.
- A clean and intuitive layout with a prominent area for document display and a sidebar for plugin controls.
- Subtle animations and transitions to enhance the user experience and provide feedback on actions.