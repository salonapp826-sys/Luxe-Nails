# 🤖 WhatsApp Automation Setup Guide

## Complete Integration: Cloudflare WhatsApp Gateway + n8n + OnSpace Backend

---

## 📋 **PART 1: OnSpace Backend (Already Built ✅)**

Your OnSpace website now has:

### **Database Tables Created:**
- ✅ `whatsapp_leads` - Customer lead storage
- ✅ `whatsapp_conversations` - Message history
- ✅ `whatsapp_followups` - Auto-follow-up scheduler
- ✅ `website_knowledge` - AI knowledge base

### **Edge Functions Created:**
- ✅ `whatsapp-webhook` - Receives messages, AI replies, captures leads
- ✅ `send-lead-notification` - Notifies admin of new leads
- ✅ `process-followups` - Sends 2hr & 24hr follow-ups
- ✅ `crawl-website` - Updates AI knowledge from website

### **Your Webhook URLs:**
```
Receive Messages: https://reyjcxfynvhkpagsreyj.backend.onspace.ai/functions/v1/whatsapp-webhook
Process Follow-ups: https://reyjcxfynvhkpagsreyj.backend.onspace.ai/functions/v1/process-followups
Crawl Website: https://reyjcxfynvhkpagsreyj.backend.onspace.ai/functions/v1/crawl-website
```

---

## 📋 **PART 2: Cloudflare WhatsApp Gateway Setup**

### **Step 1: Create Cloudflare Account**
1. Go to https://www.cloudflare.com/
2. Sign up for free account
3. Go to Workers & Pages

### **Step 2: Deploy WhatsApp Gateway Worker**

**Create new Worker:**
```javascript
// cloudflare-whatsapp-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Incoming WhatsApp messages
  if (url.pathname === '/incoming' && request.method === 'POST') {
    const data = await request.json()
    
    // Forward to OnSpace backend
    const response = await fetch('https://reyjcxfynvhkpagsreyj.backend.onspace.ai/functions/v1/whatsapp-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: data.from,
        message: data.message,
        name: data.name || null
      })
    })
    
    const result = await response.json()
    
    // Return AI reply to WhatsApp
    return new Response(JSON.stringify({
      message: result.reply
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Outgoing messages endpoint
  if (url.pathname === '/send' && request.method === 'POST') {
    const { phone, message } = await request.json()
    
    // TODO: Implement WhatsApp sending logic
    // This will be configured with your WhatsApp connection
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Sent'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response('WhatsApp Gateway Active', { status: 200 })
}
```

**Deploy Worker:**
1. Click "Create Worker"
2. Paste above code
3. Click "Save and Deploy"
4. Note your worker URL: `https://whatsapp-gateway.YOUR-SUBDOMAIN.workers.dev`

### **Step 3: Connect WhatsApp Web**

Since Cloudflare doesn't provide direct WhatsApp Web integration, use **WA-Automate** or **Baileys** library:

**Alternative: Use WA-Automate (Recommended)**

Install on your local machine or VPS:

```bash
npm install @open-wa/wa-automate
```

Create `whatsapp-bridge.js`:

```javascript
const wa = require('@open-wa/wa-automate');

wa.create({
  sessionId: "LUXENAILS_BOT",
  authTimeout: 60,
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: 'EN',
  logConsole: false,
  popup: true,
  qrTimeout: 0,
}).then(client => start(client));

function start(client) {
  console.log('✅ WhatsApp Connected!');
  
  // Listen to incoming messages
  client.onMessage(async message => {
    if (message.isGroupMsg) return; // Ignore group messages
    
    const phone = message.from.replace('@c.us', '');
    const text = message.body;
    const name = message.sender.pushname || null;
    
    console.log(`📱 Message from ${phone}: ${text}`);
    
    // Send to Cloudflare Worker
    const response = await fetch('https://whatsapp-gateway.YOUR-SUBDOMAIN.workers.dev/incoming', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: phone, message: text, name })
    });
    
    const result = await response.json();
    
    // Reply to customer
    if (result.message) {
      await client.sendText(message.from, result.message);
      console.log(`🤖 Bot replied: ${result.message}`);
    }
  });
  
  // API endpoint to send messages (for follow-ups)
  const express = require('express');
  const app = express();
  app.use(express.json());
  
  app.post('/send', async (req, res) => {
    const { phone, message } = req.body;
    
    try {
      await client.sendText(`${phone}@c.us`, message);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.listen(3000, () => {
    console.log('🚀 WhatsApp Bridge API running on port 3000');
  });
}
```

**Run the bridge:**
```bash
node whatsapp-bridge.js
```

Scan QR code with your WhatsApp number: **+91 6376539366**

---

## 📋 **PART 3: n8n Workflow Setup**

### **Step 1: Install n8n**

**Option A: Cloud (Easiest)**
- Go to https://n8n.io/
- Sign up for free account

**Option B: Self-hosted**
```bash
npm install -g n8n
n8n start
```

### **Step 2: Import Workflow**

**Copy this n8n workflow JSON:**

```json
{
  "name": "WhatsApp Automation",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-incoming",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook - Incoming Messages",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "whatsapp-incoming"
    },
    {
      "parameters": {
        "url": "https://reyjcxfynvhkpagsreyj.backend.onspace.ai/functions/v1/whatsapp-webhook",
        "method": "POST",
        "bodyParameters": {
          "parameters": [
            {
              "name": "phone",
              "value": "={{$json[\"phone\"]}}"
            },
            {
              "name": "message",
              "value": "={{$json[\"message\"]}}"
            },
            {
              "name": "name",
              "value": "={{$json[\"name\"]}}"
            }
          ]
        },
        "options": {}
      },
      "name": "Forward to OnSpace Backend",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    },
    {
      "parameters": {
        "respondWith": "={{$json[\"reply\"]}}",
        "options": {}
      },
      "name": "Return AI Reply",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [650, 300]
    },
    {
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyHour"
            }
          ]
        }
      },
      "name": "Schedule - Every Hour",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 500]
    },
    {
      "parameters": {
        "url": "https://reyjcxfynvhkpagsreyj.backend.onspace.ai/functions/v1/process-followups",
        "method": "POST",
        "options": {}
      },
      "name": "Process Follow-ups",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 500]
    },
    {
      "parameters": {
        "url": "http://localhost:3000/send",
        "method": "POST",
        "bodyParameters": {
          "parameters": [
            {
              "name": "phone",
              "value": "={{$json[\"phone\"]}}"
            },
            {
              "name": "message",
              "value": "={{$json[\"message\"]}}"
            }
          ]
        },
        "options": {}
      },
      "name": "Send WhatsApp Message",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 500]
    },
    {
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyDay",
              "hour": 2
            }
          ]
        }
      },
      "name": "Schedule - Daily 2AM",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 700]
    },
    {
      "parameters": {
        "url": "https://reyjcxfynvhkpagsreyj.backend.onspace.ai/functions/v1/crawl-website",
        "method": "POST",
        "options": {}
      },
      "name": "Crawl Website Daily",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 700]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json[\"leadCaptured\"]}}",
              "value2": "true"
            }
          ]
        }
      },
      "name": "Check If Lead Captured",
      "type": "n8n-nodes-base.if",
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:3000/send",
        "method": "POST",
        "bodyParameters": {
          "parameters": [
            {
              "name": "phone",
              "value": "+917073741421"
            },
            {
              "name": "message",
              "value": "🔔 *New Website Lead*\\n\\n👤 *Name:* {{$json[\"name\"]}}\\n📍 *City:* {{$json[\"city\"]}}\\n🎯 *Service:* {{$json[\"requirement\"]}}\\n📱 *Phone:* {{$json[\"phone\"]}}"
            }
          ]
        },
        "options": {}
      },
      "name": "Notify Admin",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 200]
    }
  ],
  "connections": {
    "Webhook - Incoming Messages": {
      "main": [
        [
          {
            "node": "Forward to OnSpace Backend",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Forward to OnSpace Backend": {
      "main": [
        [
          {
            "node": "Check If Lead Captured",
            "type": "main",
            "index": 0
          },
          {
            "node": "Return AI Reply",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check If Lead Captured": {
      "main": [
        [
          {
            "node": "Notify Admin",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Schedule - Every Hour": {
      "main": [
        [
          {
            "node": "Process Follow-ups",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Follow-ups": {
      "main": [
        [
          {
            "node": "Send WhatsApp Message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Schedule - Daily 2AM": {
      "main": [
        [
          {
            "node": "Crawl Website Daily",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Import Steps:**
1. Open n8n dashboard
2. Click "Import from File" or "Import from URL"
3. Paste above JSON
4. Click "Import"
5. Activate workflow

---

## 📋 **PART 4: Testing & Deployment**

### **Test 1: Manual Crawl**
```bash
curl -X POST https://reyjcxfynvhkpagsreyj.backend.onspace.ai/functions/v1/crawl-website
```

Expected: `{"success":true,"message":"Website crawled successfully"}`

### **Test 2: Send Test Message**
Send WhatsApp message to **+91 6376539366**:
```
Hi! I want manicure service
```

Expected bot reply:
```
Namaste! Main aapki help kar sakta/sakti hun. 
Manicure service ke liye aapka naam kya hai?
```

### **Test 3: Complete Lead Capture**
Continue conversation:
```
User: My name is Rahul
Bot: Nice to meet you Rahul! Aap kahan se hain?

User: I'm from Delhi
Bot: Perfect Rahul! Aapko kaun si specific service chahiye - basic manicure ya koi special design?

User: Basic manicure
Bot: Perfect! Main aapki booking confirm kar raha hun. Aapko call/message milega shortly. Thank you!
```

**Admin receives:**
```
🔔 New Website Lead

👤 Name: Rahul
📍 City: Delhi
🎯 Service: Basic manicure
📱 Phone: +91XXXXXXXXXX

Time: [timestamp]
```

### **Test 4: Follow-ups**
Wait 2 hours or manually trigger:
```bash
curl -X POST https://reyjcxfynvhkpagsreyj.backend.onspace.ai/functions/v1/process-followups
```

Customer receives automated follow-up message.

---

## 📋 **PART 5: Maintenance**

### **Daily Auto-Tasks (via n8n):**
- ✅ Website crawl at 2 AM (updates AI knowledge)
- ✅ Follow-up processing every hour
- ✅ Admin notifications in real-time

### **Monitor Leads:**
Go to OnSpace Cloud Dashboard:
1. Click "Cloud" (top-right)
2. Go to "Data" tab
3. Select `whatsapp_leads` table
4. View all captured leads

### **View Conversations:**
Select `whatsapp_conversations` table to see full message history

---

## 🎯 **SUMMARY: What You Built**

### **Customer Experience:**
1. Customer sends WhatsApp to **+91 6376539366**
2. AI bot replies in Hinglish based on website data
3. Bot captures name, city, requirement
4. Bot sends friendly booking confirmation

### **Admin Experience:**
1. Instant notification on **+91 7073741421**
2. All leads stored in database
3. Full conversation history available
4. Auto-follow-ups sent automatically

### **Behind the Scenes:**
- WhatsApp Web ↔ WA-Automate Bridge
- Bridge ↔ Cloudflare Worker
- Worker ↔ OnSpace Edge Functions
- Edge Functions ↔ OnSpace AI + Database
- n8n orchestrates scheduling & notifications

---

## 🆘 **Troubleshooting**

### **Bot not replying:**
- Check WhatsApp bridge is running: `node whatsapp-bridge.js`
- Verify Cloudflare Worker is deployed
- Check n8n workflow is activated

### **Admin not getting notifications:**
- Verify WhatsApp bridge `/send` endpoint works
- Check n8n "Notify Admin" node configuration
- Ensure phone number format: `+917073741421`

### **AI giving wrong answers:**
- Run website crawl manually
- Check `website_knowledge` table has content
- Update service info in `crawl-website` function

### **Follow-ups not sending:**
- Check n8n schedule trigger is active
- Verify `whatsapp_followups` table has pending entries
- Test `process-followups` function manually

---

## ✅ **NEXT STEPS**

1. **Run Initial Crawl:**
   ```bash
   curl -X POST https://reyjcxfynvhkpagsreyj.backend.onspace.ai/functions/v1/crawl-website
   ```

2. **Start WhatsApp Bridge:**
   ```bash
   cd /path/to/whatsapp-bridge
   node whatsapp-bridge.js
   # Scan QR with +91 6376539366
   ```

3. **Activate n8n Workflow:**
   - Import JSON above
   - Click "Activate" toggle

4. **Test End-to-End:**
   - Send test message to +91 6376539366
   - Verify AI replies
   - Check admin gets notification
   - Confirm lead appears in database

5. **Go Live! 🚀**

---

**Your WhatsApp number (+91 6376539366) is now an AI-powered booking assistant!**

No changes to website needed - existing WhatsApp button works automatically! 🎉
