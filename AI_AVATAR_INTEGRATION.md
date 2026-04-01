# ═══════════════════════════════════════════════════════════════════════
# 🎨 AI Avatar Creation Service - Backend API
# ═══════════════════════════════════════════════════════════════════════
# Integration with AI Services (OpenAI DALL-E, Midjourney, or Replicate)
# ═══════════════════════════════════════════════════════════════════════

## 📋 Overview

This document explains how to integrate AI avatar generation into the backend.

---

## 🔧 Option 1: OpenAI DALL-E 3 (Recommended)

### Installation
```bash
npm install openai
```

### Backend Code (Node.js/Express)

```javascript
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ═══════════════════════════════════════════════════════════════════════
// Generate Avatar from Photo
// ═══════════════════════════════════════════════════════════════════════
export async function generateAvatarFromPhoto(req, res) {
  try {
    const { photoBase64, style = 'cartoon', gender, age } = req.body;

    // Validate input
    if (!photoBase64) {
      return res.status(400).json({ error: 'Photo is required' });
    }

    // Prepare prompt
    const prompt = `Create a cute, friendly, and colorful cartoon avatar for a ${age}-year-old ${gender} child based on this photo. 
    Style: Disney/Pixar cartoon character
    Features: Big expressive eyes, warm smile, vibrant colors
    Background: Simple gradient or solid color
    Make it child-friendly and appealing for ages 7-14
    Full body or head and shoulders portrait`;

    // Option A: Using DALL-E 3 Image Generation (Text-to-Image)
    // Note: DALL-E 3 doesn't support image-to-image directly
    // You'll need to describe the photo or use image analysis first
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    });

    const imageUrl = response.data[0].url;

    // Download and save image
    const imageBuffer = await downloadImage(imageUrl);
    const filename = `avatar_${Date.now()}.png`;
    const filepath = path.join('uploads', 'avatars', filename);
    
    fs.writeFileSync(filepath, imageBuffer);

    res.json({
      success: true,
      avatarUrl: `/uploads/avatars/${filename}`,
      originalUrl: imageUrl,
    });

  } catch (error) {
    console.error('Avatar Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate avatar',
      message: error.message 
    });
  }
}

// Helper: Download image from URL
async function downloadImage(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}
```

---

## 🔧 Option 2: Replicate.com (Image-to-Image)

### Installation
```bash
npm install replicate
```

### Backend Code

```javascript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateAvatarReplicate(req, res) {
  try {
    const { photoBase64 } = req.body;

    // Convert base64 to data URI
    const photoDataUri = `data:image/jpeg;base64,${photoBase64}`;

    // Use Toonify or similar model
    const output = await replicate.run(
      "cjwbw/toonify:83b95df64da4dcf5ad7f476d2e7c4daa4e2a5f7cdce7cc2e4f66e0e7cb2a5e4e",
      {
        input: {
          image: photoDataUri,
          style: "cartoon",
        }
      }
    );

    res.json({
      success: true,
      avatarUrl: output,
    });

  } catch (error) {
    console.error('Replicate Error:', error);
    res.status(500).json({ error: 'Avatar generation failed' });
  }
}
```

---

## 🔧 Option 3: Stable Diffusion (Self-hosted or API)

### Using Stability AI API

```javascript
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

export async function generateAvatarStability(req, res) {
  try {
    const { photoBase64 } = req.body;

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(photoBase64.split(',')[1], 'base64');

    const formData = new FormData();
    formData.append('init_image', imageBuffer, 'photo.jpg');
    formData.append('init_image_mode', 'IMAGE_STRENGTH');
    formData.append('image_strength', 0.35);
    formData.append('text_prompts[0][text]', 
      'cute cartoon character, pixar style, child-friendly, colorful, big eyes, warm smile');
    formData.append('text_prompts[0][weight]', 1);
    formData.append('cfg_scale', 7);
    formData.append('samples', 1);
    formData.append('steps', 30);

    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
      {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.artifacts && data.artifacts.length > 0) {
      const avatarBase64 = data.artifacts[0].base64;
      const filename = `avatar_${Date.now()}.png`;
      const filepath = path.join('uploads', 'avatars', filename);
      
      fs.writeFileSync(filepath, Buffer.from(avatarBase64, 'base64'));

      res.json({
        success: true,
        avatarUrl: `/uploads/avatars/${filename}`,
      });
    } else {
      throw new Error('No avatar generated');
    }

  } catch (error) {
    console.error('Stability AI Error:', error);
    res.status(500).json({ error: 'Avatar generation failed' });
  }
}
```

---

## 🔧 Option 4: Midjourney (via Discord Bot)

```javascript
// Requires setting up a Discord bot and Midjourney API wrapper
import { Midjourney } from 'midjourney';

const client = new Midjourney({
  ServerId: process.env.MIDJOURNEY_SERVER_ID,
  ChannelId: process.env.MIDJOURNEY_CHANNEL_ID,
  SalaiToken: process.env.MIDJOURNEY_TOKEN,
});

export async function generateAvatarMidjourney(req, res) {
  try {
    await client.Connect();

    const prompt = 'cute cartoon child avatar, pixar style, colorful, big eyes, friendly smile --ar 1:1 --v 5';
    
    const msg = await client.Imagine(prompt);
    const avatar = await msg.upscale(1); // Upscale first image

    res.json({
      success: true,
      avatarUrl: avatar.uri,
    });

  } catch (error) {
    console.error('Midjourney Error:', error);
    res.status(500).json({ error: 'Avatar generation failed' });
  }
}
```

---

## 🔧 .NET Backend Implementation

### Controller (C#)

```csharp
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class AvatarController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public AvatarController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateAvatar([FromBody] AvatarRequest request)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var apiKey = _configuration["OpenAI:ApiKey"];

            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var payload = new
            {
                model = "dall-e-3",
                prompt = $"Create a cute cartoon avatar for a {request.Gender} child, {request.Age} years old. Disney/Pixar style, colorful, friendly, big eyes",
                n = 1,
                size = "1024x1024"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json"
            );

            var response = await client.PostAsync(
                "https://api.openai.com/v1/images/generations",
                content
            );

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<OpenAIImageResponse>(jsonResponse);

                return Ok(new { 
                    success = true, 
                    avatarUrl = result.Data[0].Url 
                });
            }

            return StatusCode(500, new { error = "Avatar generation failed" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class AvatarRequest
{
    public string PhotoBase64 { get; set; }
    public string Gender { get; set; }
    public int Age { get; set; }
}

public class OpenAIImageResponse
{
    public List<ImageData> Data { get; set; }
}

public class ImageData
{
    public string Url { get; set; }
}
```

---

## 📊 Cost Comparison

| Service | Cost per Image | Quality | Speed |
|---------|---------------|---------|-------|
| OpenAI DALL-E 3 | $0.040 (1024x1024) | ⭐⭐⭐⭐⭐ | Fast (10-30s) |
| Replicate Toonify | $0.002-0.01 | ⭐⭐⭐⭐ | Fast (5-15s) |
| Stability AI | $0.002-0.01 | ⭐⭐⭐⭐ | Medium (20-40s) |
| Midjourney | ~$0.05 | ⭐⭐⭐⭐⭐ | Slow (60-120s) |

---

## 🔐 Environment Variables

```env
# .env file
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
STABILITY_API_KEY=sk-...
MIDJOURNEY_SERVER_ID=...
MIDJOURNEY_CHANNEL_ID=...
MIDJOURNEY_TOKEN=...
```

---

## 🚀 Frontend Integration

Update the `generateAIAvatar` function in `AvatarCreator.jsx`:

```javascript
const generateAIAvatar = async (photoData) => {
  setIsProcessingAI(true);
  setAiProgress(0);

  const progressInterval = setInterval(() => {
    setAiProgress(prev => Math.min(prev + 10, 90));
  }, 300);

  try {
    const response = await fetch('/api/avatar/generate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ 
        photoBase64: photoData,
        gender: avatarData.gender,
        age: 10, // or from user input
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      setAvatarData(prev => ({ ...prev, aiAvatarUrl: data.avatarUrl }));
      setAiProgress(100);
      
      setTimeout(() => {
        setStep(2);
        setIsProcessingAI(false);
      }, 1000);
    } else {
      throw new Error(data.error);
    }
    
  } catch (error) {
    console.error('AI Avatar Generation Error:', error);
    alert('حدث خطأ في إنشاء الأفاتار. الرجاء المحاولة مرة أخرى');
    setIsProcessingAI(false);
    setPhotoPreview(null);
  } finally {
    clearInterval(progressInterval);
  }
};
```

---

## ✅ Recommendation

**Best Choice: Replicate.com Toonify Model**

**Reasons:**
1. ✅ Specifically designed for photo-to-cartoon conversion
2. ✅ Very affordable ($0.002 per image)
3. ✅ Fast processing (5-15 seconds)
4. ✅ High quality, child-friendly results
5. ✅ Easy integration
6. ✅ Reliable API

---

## 📝 Next Steps

1. Sign up for Replicate.com
2. Get API token
3. Implement backend endpoint
4. Test with sample photos
5. Add error handling
6. Monitor costs
7. Add caching for generated avatars

---

**Happy Coding! 🎨✨**
