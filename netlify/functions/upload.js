const { writeFile, mkdir } = require('fs/promises');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const body = event.body;
    
    // For now, we'll store files in a temporary location
    // In production, you might want to use S3 or another cloud storage service
    const filename = `upload-${uuidv4()}.enc`;
    const uploadDir = join('/tmp', 'uploads');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Extract file data from multipart form
    const fileData = extractFileFromMultipart(body, boundary);
    
    if (!fileData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No file found in request' })
      };
    }

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, fileData.content);

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        url: `/uploads/${filename}`,
        filename: filename
      })
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Upload failed' })
    };
  }
};

function extractFileFromMultipart(body, boundary) {
  // Simple multipart parser for demonstration
  // In production, you might want to use a library like 'busboy' or 'multer'
  const parts = body.split(`--${boundary}`);
  
  for (const part of parts) {
    if (part.includes('Content-Type:') && part.includes('Content-Disposition:')) {
      const lines = part.split('\r\n');
      let contentStart = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === '') {
          contentStart = i + 1;
          break;
        }
      }
      
      if (contentStart > 0) {
        const content = lines.slice(contentStart).join('\r\n');
        return { content: Buffer.from(content, 'binary') };
      }
    }
  }
  
  return null;
}
