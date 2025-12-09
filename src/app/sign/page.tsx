
import { Suspense } from 'react';

function IframeContent() {
  return (
    <iframe
      src="/viewer.html?pdf=/sample.pdf"
      className="w-full h-full border-0"
      allowFullScreen
    ></iframe>
  );
}

export default function SignPage() {
  return (
    <div className="w-full h-[calc(100vh-10rem)] p-0 m-0">
      <Suspense fallback={<div className="w-full h-full bg-gray-200 animate-pulse"></div>}>
        <IframeContent />
      </Suspense>
    </div>
  );
}
