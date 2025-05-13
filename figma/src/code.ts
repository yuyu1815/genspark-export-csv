// This file contains the main code for the Figma plugin
// It communicates with the UI and handles the conversion of HTML to Figma

import { htmlToFigma } from 'html-to-figma-lib';

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 450, height: 550 });

// Called when a message is received from the UI
figma.ui.onmessage = async (msg) => {
  // Handle messages from the UI
  if (msg.type === 'convert-html') {
    try {
      // Show a loading notification
      figma.notify('Converting HTML to Figma...');

      // Convert HTML to Figma nodes
      const nodes = await convertHtmlToFigma(msg.html);

      // Create a new page for the converted nodes
      const page = figma.createPage();
      page.name = 'HTML Import - ' + new Date().toLocaleString();

      // Add the nodes to the page
      nodes.forEach(node => {
        page.appendChild(node);
      });

      // Select the new page
      figma.currentPage = page;

      // Notify the user
      figma.notify('HTML converted successfully!');

      // Send a success message back to the UI
      figma.ui.postMessage({ 
        type: 'conversion-complete',
        success: true,
        message: 'HTML converted successfully!'
      });
    } catch (error) {
      console.error('Error converting HTML to Figma:', error);

      // Notify the user of the error
      figma.notify('Error converting HTML to Figma: ' + error.message, { error: true });

      // Send an error message back to the UI
      figma.ui.postMessage({ 
        type: 'conversion-complete',
        success: false,
        message: 'Error: ' + error.message
      });
    }
  } else if (msg.type === 'cancel') {
    // User clicked cancel
    figma.closePlugin();
  } else if (msg.type === 'about') {
    // Show about information
    figma.notify('HTML to Figma Plugin v1.0.0');

    // Send detailed about information back to the UI
    figma.ui.postMessage({
      type: 'about-info',
      version: '1.0.0',
      description: 'This plugin converts HTML code to Figma designs using the html-to-figma-lib library.',
      features: [
        'Converts HTML elements to Figma layers',
        'Supports text, images, and basic styling',
        'Preserves layout structure',
        'Uses auto layout for better results'
      ],
      author: 'GenSpark Team',
      lastUpdated: new Date().toLocaleDateString()
    });
  }
};

// Function to convert HTML to Figma
async function convertHtmlToFigma(html: string): Promise<SceneNode[]> {
  try {
    // Check if the Figma plugin API is available
    if (!figma) {
      throw new Error('Figma plugin API not available');
    }

    // Validate input HTML
    if (!html || html.trim() === '') {
      throw new Error('HTML content is empty');
    }

    try {
      // Create a temporary DOM element to hold the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Check if parsing was successful
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Invalid HTML: ' + parseError.textContent);
      }

      const element = doc.body;

      // Convert HTML to Figma nodes using the html-to-figma library
      // The library expects an HTMLElement or selector string as the first parameter
      // and a boolean for useAutoLayout as the second parameter
      const result = await htmlToFigma(element, true);

      // Load any fonts used in the HTML
      await loadFonts(result);

      // Create Figma nodes from the result
      const nodes: SceneNode[] = [];

      // Process the result and create Figma nodes
      if (result) {
        // Create a root frame
        const rootFrame = figma.createFrame();
        rootFrame.name = 'HTML Import';

        // Set the size of the frame based on the result
        rootFrame.resize(result.width || 800, result.height || 600);

        // Recursively create Figma nodes from the result
        createFigmaNodesFromResult(result, rootFrame);

        // Add the root frame to the list of nodes
        nodes.push(rootFrame);
      } else {
        throw new Error('HTML conversion resulted in no content');
      }

      return nodes;
    } catch (parseError) {
      console.error('Error parsing HTML:', parseError);
      throw new Error('Failed to parse HTML: ' + parseError.message);
    }
  } catch (error) {
    console.error('Error in convertHtmlToFigma:', error);

    // Provide more specific error messages based on error type
    if (error instanceof TypeError) {
      throw new Error('Type error during conversion: ' + error.message);
    } else if (error.message.includes('html-to-figma')) {
      throw new Error('Error in HTML to Figma conversion library: ' + error.message);
    } else {
      throw error;
    }
  }
}

// Function to recursively create Figma nodes from the result
function createFigmaNodesFromResult(layerNode: any, parentNode: FrameNode | GroupNode) {
  // Handle different node types
  switch (layerNode.type) {
    case 'FRAME':
      createFrameNode(layerNode, parentNode);
      break;
    case 'TEXT':
      createTextNode(layerNode, parentNode);
      break;
    case 'RECTANGLE':
      createRectangleNode(layerNode, parentNode);
      break;
    case 'SVG':
      createSvgNode(layerNode, parentNode);
      break;
    case 'GROUP':
      createGroupNode(layerNode, parentNode);
      break;
    default:
      // For unsupported types, create a rectangle as a placeholder
      createPlaceholderNode(layerNode, parentNode);
      break;
  }
}

// Function to create a frame node
function createFrameNode(layerNode: any, parentNode: FrameNode | GroupNode) {
  const frame = figma.createFrame();
  frame.name = layerNode.name || 'Frame';

  // Set position and size
  frame.x = layerNode.x || 0;
  frame.y = layerNode.y || 0;
  frame.resize(layerNode.width || 100, layerNode.height || 100);

  // Set fills if available
  if (layerNode.fills) {
    frame.fills = layerNode.fills;
  }

  // Set other properties if available
  if (layerNode.opacity !== undefined) {
    frame.opacity = layerNode.opacity;
  }

  // Add the frame to the parent
  parentNode.appendChild(frame);

  // Process children recursively
  if (layerNode.children && layerNode.children.length > 0) {
    layerNode.children.forEach((child: any) => {
      createFigmaNodesFromResult(child, frame);
    });
  }
}

// Function to create a text node
function createTextNode(layerNode: any, parentNode: FrameNode | GroupNode) {
  const text = figma.createText();
  text.name = layerNode.name || 'Text';

  // Set position and size
  text.x = layerNode.x || 0;
  text.y = layerNode.y || 0;

  // Set text content
  if (layerNode.characters) {
    text.characters = layerNode.characters;
  }

  // Set font if available
  if (layerNode.fontName) {
    text.fontName = layerNode.fontName;
  }

  // Set font size if available
  if (layerNode.fontSize) {
    text.fontSize = layerNode.fontSize;
  }

  // Set other properties if available
  if (layerNode.fills) {
    text.fills = layerNode.fills;
  }

  if (layerNode.opacity !== undefined) {
    text.opacity = layerNode.opacity;
  }

  // Add the text to the parent
  parentNode.appendChild(text);
}

// Function to create a rectangle node
function createRectangleNode(layerNode: any, parentNode: FrameNode | GroupNode) {
  const rect = figma.createRectangle();
  rect.name = layerNode.name || 'Rectangle';

  // Set position and size
  rect.x = layerNode.x || 0;
  rect.y = layerNode.y || 0;
  rect.resize(layerNode.width || 100, layerNode.height || 100);

  // Set fills if available
  if (layerNode.fills) {
    rect.fills = layerNode.fills;
  }

  // Set other properties if available
  if (layerNode.opacity !== undefined) {
    rect.opacity = layerNode.opacity;
  }

  // Add the rectangle to the parent
  parentNode.appendChild(rect);
}

// Function to create an SVG node
function createSvgNode(layerNode: any, parentNode: FrameNode | GroupNode) {
  // For SVG, we'll create a frame as a placeholder
  // In a real implementation, you'd use figma.createNodeFromSvg
  const frame = figma.createFrame();
  frame.name = layerNode.name || 'SVG';

  // Set position and size
  frame.x = layerNode.x || 0;
  frame.y = layerNode.y || 0;
  frame.resize(layerNode.width || 100, layerNode.height || 100);

  // Add the frame to the parent
  parentNode.appendChild(frame);
}

// Function to create a group node
function createGroupNode(layerNode: any, parentNode: FrameNode | GroupNode) {
  const group = figma.createGroup([], parentNode);
  group.name = layerNode.name || 'Group';

  // Set position
  group.x = layerNode.x || 0;
  group.y = layerNode.y || 0;

  // Process children recursively
  if (layerNode.children && layerNode.children.length > 0) {
    layerNode.children.forEach((child: any) => {
      createFigmaNodesFromResult(child, group);
    });
  }
}

// Function to create a placeholder node for unsupported types
function createPlaceholderNode(layerNode: any, parentNode: FrameNode | GroupNode) {
  const rect = figma.createRectangle();
  rect.name = `Placeholder (${layerNode.type || 'Unknown'})`;

  // Set position and size
  rect.x = layerNode.x || 0;
  rect.y = layerNode.y || 0;
  rect.resize(layerNode.width || 100, layerNode.height || 100);

  // Set a placeholder fill
  rect.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];

  // Add the placeholder to the parent
  parentNode.appendChild(rect);
}

// Function to load fonts used in the HTML
async function loadFonts(layerNode: any) {
  // Create a set to store unique font names
  const fontNames = new Set<FontName>();

  // Recursively traverse the layer node to find all text nodes
  const traverseForFonts = (node: any) => {
    if (node.type === 'TEXT' && node.fontName) {
      fontNames.add(node.fontName);
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => traverseForFonts(child));
    }
  };

  traverseForFonts(layerNode);

  // Load all fonts
  const fontLoadPromises = Array.from(fontNames).map(fontName => {
    return figma.loadFontAsync(fontName);
  });

  try {
    await Promise.all(fontLoadPromises);
    console.log('All fonts loaded successfully');
  } catch (error) {
    console.error('Error loading fonts:', error);
    // Continue with available fonts
  }
}

// Function to fetch image data
async function fetchImageData(url: string): Promise<Uint8Array | null> {
  try {
    // For Figma plugin, we need to use figma.ui.postMessage to communicate with the UI
    // and have the UI fetch the image data
    return new Promise((resolve, reject) => {
      // Generate a unique ID for this request
      const requestId = 'img_' + Date.now();

      // Set up a listener for the response
      const messageListener = (event: MessageEvent) => {
        const message = event.data.pluginMessage;
        if (!message || message.requestId !== requestId) return;

        // Remove the listener once we get the response
        window.removeEventListener('message', messageListener);

        if (message.success) {
          resolve(message.data);
        } else {
          reject(new Error(message.error));
        }
      };

      window.addEventListener('message', messageListener);

      // Send the request to the UI
      figma.ui.postMessage({
        type: 'fetch-image',
        url,
        requestId
      });

      // Set a timeout to reject the promise if no response is received
      setTimeout(() => {
        window.removeEventListener('message', messageListener);
        reject(new Error('Timeout fetching image data'));
      }, 10000); // 10 second timeout
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}
