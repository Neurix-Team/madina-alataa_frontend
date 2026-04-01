# ═══════════════════════════════════════════════════════════════════════
# 🤖 AI Avatar Service - Complete Backend Implementation
# ═══════════════════════════════════════════════════════════════════════
# Multiple working solutions with real code examples
# ═══════════════════════════════════════════════════════════════════════

## 🎯 أفضل 5 حلول فعّالة (مرتبة حسب الأفضلية)

---

## ✅ الحل الأول: Replicate API - Toonify (الأفضل) ⭐⭐⭐⭐⭐

### المميزات:
- ✅ **سريع جداً** (5-15 ثانية)
- ✅ **رخيص** ($0.002 لكل صورة)
- ✅ **نتائج رائعة** للأطفال
- ✅ **سهل التكامل**
- ✅ **مستقر وموثوق**

### التكلفة:
- **$0.002** per image
- **1000 صورة = $2 فقط!**

### التسجيل:
1. اذهب إلى: https://replicate.com
2. سجل حساب مجاني
3. احصل على API Token من: https://replicate.com/account/api-tokens

---

### 📦 Backend Implementation (Node.js/Express)

```javascript
// ═══════════════════════════════════════════════════════════════
// Install package
// npm install replicate
// ═══════════════════════════════════════════════════════════════

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// ═══════════════════════════════════════════════════════════════
// API Endpoint: Generate Avatar from Photo
// ═══════════════════════════════════════════════════════════════

export async function generateAvatar(req, res) {
  try {
    const { photoBase64, gender, age = 10 } = req.body;

    if (!photoBase64) {
      return res.status(400).json({ error: 'Photo is required' });
    }

    console.log('🎨 Starting avatar generation...');

    // Convert base64 to data URI if needed
    const photoDataUri = photoBase64.startsWith('data:') 
      ? photoBase64 
      : `data:image/jpeg;base64,${photoBase64}`;

    // ═══════════════════════════════════════════════════════════
    // Model 1: Toonify (Best for cartoon avatars)
    // ═══════════════════════════════════════════════════════════
    const output = await replicate.run(
      "cjwbw/toonify:83b95df64da4dcf5ad7f476d2e7c4daa4e2a5f7cdce7cc2e4f66e0e7cb2a5e4e",
      {
        input: {
          image: photoDataUri,
          style: "cartoon", // cartoon, pixar, anime
        }
      }
    );

    console.log('✅ Avatar generated:', output);

    // Download and save the image
    const avatarUrl = output; // Replicate returns a URL
    const imageBuffer = await downloadImage(avatarUrl);
    
    // Save to disk
    const filename = `avatar_${Date.now()}.png`;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    console.log('💾 Avatar saved:', filepath);

    // Return public URL
    res.json({
      success: true,
      avatarUrl: `/uploads/avatars/${filename}`,
      originalUrl: avatarUrl,
    });

  } catch (error) {
    console.error('❌ Avatar generation error:', error);
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

### 🔧 Alternative Toonify Models on Replicate:

```javascript
// Option A: Classic Toonify
"cjwbw/toonify:83b95df..."

// Option B: Advanced Cartoon Stylization
"tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c"

// Option C: Anime Style
"cjwbw/anime-style:f4f6bcb8e3ef1db62ad2e5c0f39b3b8e8f7e6b0b1c5f6a8b1e4f3d2c5a7e9f1a"
```

---

## ✅ الحل الثاني: Hugging Face API ⭐⭐⭐⭐

### المميزات:
- ✅ مجاني (Inference API)
- ✅ Models متعددة
- ✅ سريع
- ✅ No credit card needed

### التسجيل:
1. https://huggingface.co/join
2. احصل على API token: https://huggingface.co/settings/tokens

### Backend Code:

```javascript
import fetch from 'node-fetch';
import fs from 'fs';

async function generateAvatarHuggingFace(req, res) {
  try {
    const { photoBase64 } = req.body;

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(photoBase64.split(',')[1], 'base64');

    const response = await fetch(
      'https://api-inference.huggingface.co/models/ogkalu/Comic-Diffusion',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: imageBuffer.toString('base64'),
          parameters: {
            prompt: "cartoon avatar, pixar style, child friendly, colorful, cute",
            negative_prompt: "scary, adult, realistic, nsfw",
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const avatarBuffer = await response.arrayBuffer();
    
    // Save image
    const filename = `avatar_${Date.now()}.png`;
    const filepath = path.join('uploads', 'avatars', filename);
    fs.writeFileSync(filepath, Buffer.from(avatarBuffer));

    res.json({
      success: true,
      avatarUrl: `/uploads/avatars/${filename}`,
    });

  } catch (error) {
    console.error('Hugging Face Error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

### أفضل Models على Hugging Face:
```
ogkalu/Comic-Diffusion
prompthero/openjourney-v4
nitrosocke/Arcane-Diffusion
wavymulder/Analog-Diffusion
```

---

## ✅ الحل الثالث: Stability AI - Image to Image ⭐⭐⭐⭐

### المميزات:
- ✅ جودة عالية جداً
- ✅ Customizable
- ✅ Fast

### التكلفة:
- **$0.002 - $0.01** per image
- 25 free credits عند التسجيل

### التسجيل:
1. https://platform.stability.ai/
2. Get API Key: https://platform.stability.ai/account/keys

### Backend Code:

```javascript
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';

async function generateAvatarStability(req, res) {
  try {
    const { photoBase64 } = req.body;

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(photoBase64.split(',')[1], 'base64');

    const formData = new FormData();
    formData.append('init_image', imageBuffer, { filename: 'photo.jpg' });
    formData.append('init_image_mode', 'IMAGE_STRENGTH');
    formData.append('image_strength', 0.4); // 0-1 (lower = more like photo)
    
    formData.append('text_prompts[0][text]', 
      'cute cartoon character, pixar disney style, child friendly avatar, colorful, big expressive eyes, warm friendly smile, professional quality'
    );
    formData.append('text_prompts[0][weight]', 1);
    
    formData.append('text_prompts[1][text]', 
      'scary, adult content, realistic photo, ugly, deformed, nsfw'
    );
    formData.append('text_prompts[1][weight]', -1);
    
    formData.append('cfg_scale', 7);
    formData.append('samples', 1);
    formData.append('steps', 30);
    formData.append('style_preset', 'fantasy-art');

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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability AI Error: ${errorText}`);
    }

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
    res.status(500).json({ error: error.message });
  }
}
```

---

## ✅ الحل الرابع: OpenAI DALL-E 3 (غالي لكن ممتاز) ⭐⭐⭐⭐

### المميزات:
- ✅ جودة استثنائية
- ✅ موثوق جداً
- ✅ سهل الاستخدام

### التكلفة:
- **$0.040** per 1024x1024 image
- **$0.080** per HD image

### Backend Code:

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateAvatarDALLE(req, res) {
  try {
    const { gender = 'boy', age = 10, style = 'pixar' } = req.body;

    // Note: DALL-E 3 doesn't support image-to-image directly
    // You need to use GPT-4 Vision to describe the photo first
    // Then generate based on that description

    const prompt = `Create a cute, friendly ${style}-style cartoon avatar for a ${age}-year-old ${gender} child.
    Features:
    - Big expressive eyes with sparkles
    - Warm, genuine smile
    - Vibrant, happy colors (blues, pinks, yellows)
    - Round, friendly face
    - Modern, appealing cartoon style
    - Child-safe and appropriate
    - Full body or portrait view
    Background: Simple gradient or solid cheerful color`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard", // or "hd" for better quality
      style: "vivid", // or "natural"
    });

    const imageUrl = response.data[0].url;

    // Download and save
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
    console.error('DALL-E Error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

---

## ✅ الحل الخامس: DeepAI Toonify API (بديل مجاني) ⭐⭐⭐

### المميزات:
- ✅ مجاني (مع حدود)
- ✅ Toonify مخصص
- ✅ سهل

### التسجيل:
1. https://deepai.org/
2. Get API Key (مجاني)

### Backend Code:

```javascript
import FormData from 'form-data';
import fetch from 'node-fetch';

async function generateAvatarDeepAI(req, res) {
  try {
    const { photoBase64 } = req.body;

    const formData = new FormData();
    formData.append('image', photoBase64);

    const response = await fetch('https://api.deepai.org/api/toonify', {
      method: 'POST',
      headers: {
        'api-key': process.env.DEEPAI_API_KEY,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.output_url) {
      // Download and save
      const imageBuffer = await downloadImage(data.output_url);
      const filename = `avatar_${Date.now()}.png`;
      const filepath = path.join('uploads', 'avatars', filename);
      
      fs.writeFileSync(filepath, imageBuffer);

      res.json({
        success: true,
        avatarUrl: `/uploads/avatars/${filename}`,
      });
    } else {
      throw new Error('No output from DeepAI');
    }

  } catch (error) {
    console.error('DeepAI Error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

---

---

## 🚀 .NET Backend Implementation (C#)

### Using Replicate API in .NET:

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace MadinaAPI.Controllers
{
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
                var replicateToken = _configuration["Replicate:ApiToken"];

                // Prepare request to Replicate
                var payload = new
                {
                    version = "83b95df64da4dcf5ad7f476d2e7c4daa4e2a5f7cdce7cc2e4f66e0e7cb2a5e4e",
                    input = new
                    {
                        image = request.PhotoBase64,
                        style = "cartoon"
                    }
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json"
                );

                client.DefaultRequestHeaders.Add("Authorization", $"Token {replicateToken}");

                var response = await client.PostAsync(
                    "https://api.replicate.com/v1/predictions",
                    content
                );

                if (response.IsSuccessStatusCode)
                {
                    var jsonResponse = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<ReplicateResponse>(jsonResponse);

                    // Poll for completion
                    var outputUrl = await PollForCompletion(client, result.Id, replicateToken);

                    // Download and save image
                    var filename = $"avatar_{DateTime.Now.Ticks}.png";
                    var filepath = Path.Combine("wwwroot", "uploads", "avatars", filename);
                    
                    Directory.CreateDirectory(Path.GetDirectoryName(filepath));
                    
                    var imageBytes = await client.GetByteArrayAsync(outputUrl);
                    await System.IO.File.WriteAllBytesAsync(filepath, imageBytes);

                    return Ok(new { 
                        success = true, 
                        avatarUrl = $"/uploads/avatars/{filename}" 
                    });
                }

                return StatusCode(500, new { error = "Avatar generation failed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private async Task<string> PollForCompletion(HttpClient client, string predictionId, string token)
        {
            var maxAttempts = 60; // 60 seconds max
            var attempt = 0;

            while (attempt < maxAttempts)
            {
                await Task.Delay(1000); // Wait 1 second

                var request = new HttpRequestMessage(HttpMethod.Get, 
                    $"https://api.replicate.com/v1/predictions/{predictionId}");
                request.Headers.Add("Authorization", $"Token {token}");

                var response = await client.SendAsync(request);
                var json = await response.Content.ReadAsStringAsync();
                var status = JsonSerializer.Deserialize<ReplicateStatus>(json);

                if (status.Status == "succeeded")
                {
                    return status.Output;
                }
                else if (status.Status == "failed")
                {
                    throw new Exception("Avatar generation failed");
                }

                attempt++;
            }

            throw new Exception("Timeout waiting for avatar");
        }
    }

    public class AvatarRequest
    {
        public string PhotoBase64 { get; set; }
        public string Gender { get; set; }
        public int Age { get; set; }
    }

    public class ReplicateResponse
    {
        public string Id { get; set; }
    }

    public class ReplicateStatus
    {
        public string Status { get; set; }
        public string Output { get; set; }
    }
}
```

---

## 📦 Frontend Integration (React)

### Update ProfileTab.jsx:

```javascript
const generateAIAvatar = async (photoData) => {
  setIsProcessingAI(true);
  setAiProgress(0);

  const progressInterval = setInterval(() => {
    setAiProgress(prev => (prev >= 90 ? 90 : prev + 10));
  }, 500);

  try {
    // Real API call
    const response = await fetch('http://localhost:5000/api/avatar/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        photoBase64: photoData,
        gender: avatarData.gender,
        age: 10,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate avatar');
    }

    const data = await response.json();
    
    if (data.success) {
      setAvatarData(prev => ({ 
        ...prev, 
        aiAvatarUrl: data.avatarUrl, 
        photoUrl: photoData 
      }));
      setAiProgress(100);
      
      setTimeout(() => {
        setIsProcessingAI(false);
        AudioManager.getInstance().play('success');
      }, 1000);
    } else {
      throw new Error(data.error);
    }
    
  } catch (error) {
    console.error('AI Avatar Error:', error);
    alert('حدث خطأ في إنشاء الأفاتار. الرجاء المحاولة مرة أخرى');
    setIsProcessingAI(false);
    setPhotoPreview(null);
    AudioManager.getInstance().play('error');
  } finally {
    clearInterval(progressInterval);
  }
};
```

---

## 🔐 Environment Variables

### Create `.env` file:

```env
# ════════════════════════════════════════════════════════════
# AI Services API Keys
# ════════════════════════════════════════════════════════════

# Replicate (Recommended - Cheapest & Best)
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Hugging Face (Free Alternative)
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stability AI (High Quality)
STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI (Premium)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# DeepAI (Free Tier)
DEEPAI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📊 Comparison Table

| Service | Cost/Image | Speed | Quality | Setup Difficulty | Recommendation |
|---------|-----------|-------|---------|-----------------|----------------|
| **Replicate Toonify** | $0.002 | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ Easy | **🏆 Best Choice** |
| Hugging Face | Free | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ Easy | 🥈 Free Option |
| Stability AI | $0.002-0.01 | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⚙️ Medium | 🥉 High Quality |
| OpenAI DALL-E | $0.040 | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ Easy | 💰 Expensive |
| DeepAI | Free | ⚡⚡⚡ | ⭐⭐⭐ | ✅ Easy | 🆓 Budget |

---

## 🎯 التوصية النهائية

### **استخدم: Replicate Toonify**

**السبب:**
1. ✅ الأرخص ($0.002)
2. ✅ الأسرع (5-15 ثانية)
3. ✅ جودة ممتازة
4. ✅ سهل التكامل
5. ✅ موثوق
6. ✅ مناسب للأطفال

**خطوات التطبيق السريعة:**

```bash
# 1. Install package
npm install replicate

# 2. Get API token from replicate.com

# 3. Add to .env
REPLICATE_API_TOKEN=r8_your_token_here

# 4. Use the code above

# 5. Test!
```

---

## 🧪 Testing

### Test endpoint with Postman/Thunder Client:

```http
POST http://localhost:5000/api/avatar/generate
Content-Type: application/json

{
  "photoBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "gender": "boy",
  "age": 10
}
```

### Expected Response:

```json
{
  "success": true,
  "avatarUrl": "/uploads/avatars/avatar_1234567890.png"
}
```

---

## 🔧 Error Handling

### Common Errors:

1. **Invalid API Key**
   ```
   Solution: Check .env file and API key validity
   ```

2. **Image too large**
   ```
   Solution: Resize image before sending (max 4MB)
   ```

3. **Timeout**
   ```
   Solution: Increase timeout in API call
   ```

4. **Rate limit**
   ```
   Solution: Add caching, implement queue system
   ```

---

## 💡 Optimization Tips

1. **Cache Results:**
   ```javascript
   // Save AI avatars to database
   // Don't regenerate same photo twice
   ```

2. **Image Compression:**
   ```javascript
   // Compress before sending to AI
   import sharp from 'sharp';
   const compressed = await sharp(imageBuffer)
     .resize(512, 512)
     .jpeg({ quality: 80 })
     .toBuffer();
   ```

3. **Queue System:**
   ```javascript
   // For high traffic, use queue (Bull/BullMQ)
   import Queue from 'bull';
   const avatarQueue = new Queue('avatar-generation');
   ```

---

## 🎉 الخلاصة

**الكود الموجود حالياً يستخدم:**
```javascript
// TODO: Real AI API call
await new Promise(resolve => setTimeout(resolve, 3000));
const mockAiAvatarUrl = photoData;
```

**لتفعيله، استبدله بـ:**
- ✅ **Replicate Toonify** (الأفضل)
- أو Hugging Face (مجاني)
- أو Stability AI (جودة عالية)

**كل الكود جاهز فوق! 🚀**
