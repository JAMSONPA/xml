import { XmlError } from '../types';

export const formatXml = (xml: string): string => {
  let formatted = '';
  let indent = '';
  const tab = '  '; // 2 spaces
  
  // Remove existing whitespace between tags to normalize
  const normalized = xml.replace(/>\s+</g, '><').trim();
  
  // Simple regex parser for indentation (more robust than DOMParser for broken fragments)
  normalized.split(/>\s*</).forEach(function(node) {
      if (node.match( /^\/\w/ )) {
          // Closing tag
          indent = indent.substring(tab.length);
      }
      
      formatted += indent + '<' + node + '>\r\n';
      
      if (node.match( /^<?\w[^>]*[^\/]$/ ) && !node.startsWith("?") && !node.startsWith("!")) {
          // Opening tag
          indent += tab;
      }
  });
  
  return formatted.substring(1, formatted.length - 3);
};

export const minifyXml = (xml: string): string => {
  return xml.replace(/>\s+</g, '><').trim();
};

export const validateXml = (xml: string): XmlError | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  
  if (errorNode) {
    const text = errorNode.textContent || "Unknown parsing error";
    // Try to extract line number if browser provides it
    const lineMatch = text.match(/line\s+(\d+)/i);
    return {
      message: text.replace(/This page contains the following errors:/, '').trim(),
      line: lineMatch ? parseInt(lineMatch[1], 10) : 0
    };
  }
  
  return null;
};

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};