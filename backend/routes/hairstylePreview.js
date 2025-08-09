const express = require('express');
const Replicate = require('replicate');
const router = express.Router();

const replicate = new Replicate({
  auth: "r8_623ZCxHy5JNuEeveRUJ2hXqDxo7nkZF3NW0nQ"
});

router.post('/', async (req, res) => {
  try {
    const { imageUrl, hairstyle, color } = req.body;
    console.log('Received /api/hairstyle-preview request:', { imageUrl, hairstyle, color });
    console.log('Replicate API Token present:', !!process.env.REPLICATE_API_TOKEN);

    if (!imageUrl || !hairstyle) {
      console.log('Missing imageUrl or hairstyle');
      return res.status(400).json({ error: "Missing imageUrl or hairstyle" });
    }

    const input = {
      image: imageUrl, // must be a public URL
      editing_type: "both",
      color_description: color || "",
      hairstyle_description: hairstyle
    };

    let output;
    try {
      output = await replicate.run(
        "wty-ustc/hairclip:b95cb2a16763bea87ed7ed851d5a3ab2f4655e94bcfb871edba029d4814fa587",
        { input }
      );
      console.log('Replicate output:', output);
    } catch (replicateErr) {
      console.error('Error from Replicate API:', replicateErr);
      return res.status(500).json({
        error: "Failed to generate hairstyle preview (Replicate error)",
        details: replicateErr.message || replicateErr
      });
    }

    // Handle both array and object output
    let resultUrl = null;
    if (Array.isArray(output)) {
      resultUrl = output[0];
    } else if (output && typeof output.url === 'function') {
      resultUrl = output.url();
    } else {
      resultUrl = output;
    }

    res.json({ result: resultUrl });
  } catch (err) {
    console.error('Error in /api/hairstyle-preview route:', err);
    res.status(500).json({ error: "Failed to generate hairstyle preview (server error)", details: err.message });
  }
});

module.exports = router;