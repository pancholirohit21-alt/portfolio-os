'use client';
import dynamic from 'next/dynamic';

const FilerobotImageEditor = dynamic(
  () => import('react-filerobot-image-editor'),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-black/50 text-white">Loading Editor...</div> }
);

export default FilerobotImageEditor;
