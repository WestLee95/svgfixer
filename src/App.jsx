import React, { useState, useRef } from 'react';
import { Upload, Copy, Download, FileCode, Zap, Layers, HardDrive, Check } from 'lucide-react';
import './App.css';

export default function SVGGSAPConverter() {
  const [cleanedSVG, setCleanedSVG] = useState('');
  const [pathCount, setPathCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [fileSize, setFileSize] = useState('0');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target.result;
        cleanSVG(svgContent);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const cleanSVG = (svgString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    const defs = svg.querySelector('defs');
    if (defs) defs.remove();

    const clipPaths = svg.querySelectorAll('[clip-path]');
    clipPaths.forEach(el => el.removeAttribute('clip-path'));

    const paths = svg.querySelectorAll('path');
    setPathCount(paths.length);

    const groups = svg.querySelectorAll('g');
    let gCount = 0;

    groups.forEach(g => {
      const transform = g.getAttribute('transform');
      if (transform) {
        const childPaths = g.querySelectorAll('path');
        childPaths.forEach(path => {
          const pathTransform = path.getAttribute('transform');
          if (pathTransform) {
            path.setAttribute('transform', transform + ' ' + pathTransform);
          } else {
            path.setAttribute('transform', transform);
          }
        });
      }
      
      while (g.firstChild) {
        g.parentNode.insertBefore(g.firstChild, g);
      }
      g.remove();
      gCount++;
    });

    setGroupCount(gCount);

    svg.removeAttribute('xmlns:xlink');
    svg.removeAttribute('zoomAndPan');
    svg.removeAttribute('preserveAspectRatio');
    svg.removeAttribute('version');

    const cleaned = new XMLSerializer().serializeToString(svg);
    setCleanedSVG(cleaned);
    setFileSize((cleaned.length / 1024).toFixed(2));
    setShowOutput(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cleanedSVG);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSVG = () => {
    const blob = new Blob([cleanedSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned-gsap-ready.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-teal-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full p-10">
        {/* Header */}
        <div className="mb-8 bg-linear-to-r from-teal-900/40 to-black/40 backdrop-blur-sm rounded-2xl p-6 border border-teal-800/30">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-emerald-400 mb-3">
            SVG → GSAP MorphSVG
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            Transform your SVG for seamless GSAP morphing compatibility
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-linear-to-r from-teal-900/30 to-emerald-900/30 border-l-4 border-teal-500 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-3">
            <Zap className="text-teal-400 mt-1 shrink-0" size={24} />
            <h3 className="text-xl font-bold text-white">What this tool does:</h3>
          </div>
          <ul className="space-y-2 ml-9 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Removes clip paths and definitions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Flattens nested groups and transforms
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Extracts and simplifies path data
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Makes your SVG GSAP MorphSVG ready
            </li>
          </ul>
        </div>

        {/* Upload Area - No Background */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-8 ${
            isDragOver
              ? 'border-teal-400 bg-teal-900/20 scale-105'
              : 'border-teal-600/50 hover:border-teal-400 hover:bg-teal-900/10'
          }`}
        >
          <Upload className="mx-auto mb-4 text-teal-400" size={56} strokeWidth={1.5} />
          <p className="text-lg font-bold text-white mb-2">
            Click to upload or drag & drop
          </p>
          <p className="text-gray-400">Your SVG file here</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Output Section */}
        {showOutput && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-linear-to-br from-teal-900/40 to-emerald-900/40 border border-teal-800/30 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FileCode className="text-teal-400" size={24} />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Paths Found
                  </span>
                </div>
                <div className="text-4xl font-black text-teal-400">{pathCount}</div>
              </div>

              <div className="bg-linear-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-800/30 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Layers className="text-emerald-400" size={24} />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Groups Removed
                  </span>
                </div>
                <div className="text-4xl font-black text-emerald-400">{groupCount}</div>
              </div>

              <div className="bg-linear-to-br from-teal-900/40 to-cyan-900/40 border border-cyan-800/30 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <HardDrive className="text-cyan-400" size={24} />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    File Size
                  </span>
                </div>
                <div className="text-4xl font-black text-cyan-400">{fileSize} KB</div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Preview:</h3>
              <div className="bg-linear-to-br from-gray-900/60 to-teal-900/30 border border-teal-800/30 rounded-xl p-8 backdrop-blur-sm">
                <div 
                  className="flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: cleanedSVG }}
                />
              </div>
            </div>

            {/* Code Output */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Cleaned SVG Code:</h3>
              <textarea
                value={cleanedSVG}
                readOnly
                className="w-full min-h-50 p-4 bg-gray-900/60 border-2 border-teal-800/30 text-gray-300 rounded-xl font-mono text-sm resize-y focus:outline-none focus:border-teal-500 backdrop-blur-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-teal-500/50 hover:scale-105 transition-all duration-200"
              >
                {copied ? (
                  <>
                    <Check size={20} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={20} />
                    Copy to Clipboard
                  </>
                )}
              </button>

              <button
                onClick={downloadSVG}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-200"
              >
                <Download size={20} />
                Download SVG
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-teal-800/30 text-center">
          <p className="text-gray-400 font-medium">
            Created by <span className="text-teal-400 font-bold">Eugene Westley</span>
          </p>
          <a 
            href="mailto:eugenewestley95@gmail.com" 
            className="text-gray-500 hover:text-teal-400 transition-colors text-sm mt-1 inline-block"
          >
            eugenewestley95@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}