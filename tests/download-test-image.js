// Script to download a test food image
import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function downloadTestImage() {
  try {
    console.log('Downloading test food image...');
    
    // URL of a test food image (apple)
    const imageUrl = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80';
    
    // Path to save the image
    const imagePath = path.join(process.cwd(), 'test-food-image.jpg');
    
    // Download the image
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });
    
    // Save the image to disk
    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('Test image downloaded successfully to:', imagePath);
        resolve(imagePath);
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading test image:', error.message);
  }
}

downloadTestImage();