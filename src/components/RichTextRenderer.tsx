"use client";

import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import Image from "next/image";

// Default empty Slate.js document - immutable constant
const EMPTY_DOCUMENT: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
];

// Helper function to create a plain text document
function createPlainTextDocument(text: string): Descendant[] {
  return [
    {
      type: 'paragraph',
      children: [{ text: text || '' }]
    }
  ];
}

// Helper function to validate Slate document structure
function isValidSlateDocument(doc: any): doc is Descendant[] {
  return Array.isArray(doc) && 
         doc.length > 0 && 
         doc.every(node => 
           node && 
           typeof node === 'object' && 
           node.type && 
           Array.isArray(node.children)
         );
}

export default function RichTextRenderer({ content }: { content: string }) {
  // Handle null/undefined content
  if (!content || typeof content !== 'string') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-muted-foreground">No content available</p>
      </div>
    );
  }

  if (content.trim().length === 0 || content === 'null' || content === 'undefined') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-muted-foreground">No content available</p>
      </div>
    );
  }

  // Try to parse as Slate.js JSON
  let slateDocument: Descendant[] = EMPTY_DOCUMENT;
  
  try {
    const parsed = JSON.parse(content);
    
    if (isValidSlateDocument(parsed)) {
      slateDocument = parsed;
    } else {
      // Invalid Slate structure, treat as plain text
      slateDocument = createPlainTextDocument(content);
    }
  } catch (error) {
    // JSON parsing failed, treat as plain text
    slateDocument = createPlainTextDocument(content);
  }

  // Final validation - this should never fail now
  if (!isValidSlateDocument(slateDocument)) {
    slateDocument = EMPTY_DOCUMENT;
  }

  // Use the validated document directly - no more variable reassignment
  return (
    <Slate editor={withReact(createEditor())} value={slateDocument} onChange={() => {}}>
      <Editable
        readOnly
        renderElement={({ attributes, children, element }) => {
          switch (element.type) {
            case "heading-one":
              return <h1 {...attributes} className="text-3xl font-bold my-6 text-foreground">{children}</h1>;
            case "heading-two":
              return <h2 {...attributes} className="text-2xl font-semibold my-4 text-foreground">{children}</h2>;
            case "heading-three":
              return <h3 {...attributes} className="text-xl font-semibold my-3 text-foreground">{children}</h3>;
            case "paragraph":
              return <p {...attributes} className="my-4 leading-relaxed text-foreground">{children}</p>;
            case "block-quote":
              return (
                <blockquote {...attributes} className="border-l-4 border-accent pl-4 my-6 italic text-muted-foreground">
                  {children}
                </blockquote>
              );
            case "bulleted-list":
              return <ul {...attributes} className="list-disc list-inside my-4 space-y-2 text-foreground">{children}</ul>;
            case "numbered-list":
              return <ol {...attributes} className="list-decimal list-inside my-4 space-y-2 text-foreground">{children}</ol>;
            case "list-item":
              return <li {...attributes} className="text-foreground">{children}</li>;
            case "code-block":
              return (
                <pre {...attributes} className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                  <code className="text-sm text-foreground">{children}</code>
                </pre>
              );
            case "image":
              return (
                <div className="my-6">
                  <Image
                    src={element.url}
                    alt={element.alt || "Blog image"}
                    width={800}
                    height={400}
                    className="rounded-lg w-full h-auto"
                  />
                  {element.alt && (
                    <p className="text-sm text-muted-foreground mt-2 text-center italic">
                      {element.alt}
                    </p>
                  )}
                </div>
              );
            default:
              return <p {...attributes} className="my-2 leading-relaxed text-foreground">{children}</p>;
          }
        }}
        renderLeaf={({ attributes, children, leaf }) => {
          if (leaf.bold) children = <strong>{children}</strong>;
          if (leaf.italic) children = <em>{children}</em>;
          if (leaf.underline) children = <u>{children}</u>;
          if (leaf.strikethrough) children = <s>{children}</s>;
          if (leaf.code) children = <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>;
          return <span {...attributes}>{children}</span>;
        }}
      />
    </Slate>
  );
}