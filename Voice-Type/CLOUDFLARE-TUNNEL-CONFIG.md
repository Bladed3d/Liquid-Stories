# Cloudflare Tunnel Configuration

## Overview
Successfully configured Cloudflare tunnel to expose TTS server (port 8001) at `tts.hivemindai.org`

## Configuration Details

### Tunnel Information
- **Tunnel ID**: ef9574fc-6439-449f-b081-6fedf87c5dab
- **Tunnel Name**: voice-type
- **Config File**: `C:\Users\Administrator\.cloudflared\config.yml`
- **Cloudflared Location**: `C:\Program Files (x86)\cloudflared\cloudflared.exe`

### Active Routes

| Subdomain | Local Service | Purpose |
|-----------|---------------|---------|
| `voice.hivemindai.org` | ws://localhost:8000 | STT (Parakeet) - WebSocket |
| `tts.hivemindai.org` | http://localhost:8001 | TTS (Qwen3) - HTTP |

### Current Config File
```yaml
tunnel: ef9574fc-6439-449f-b081-6fedf87c5dab
credentials-file: C:\Users\Administrator\.cloudflared\ef9574fc-6439-449f-b081-6fedf87c5dab.json

ingress:
  - hostname: voice.hivemindai.org
    service: ws://localhost:8000
  - hostname: tts.hivemindai.org
    service: http://localhost:8001
  - service: http_status:404
```

## Setup Steps Performed

1. **Located existing tunnel config** at `C:\Users\Administrator\.cloudflared\config.yml`
2. **Backed up config** to `config.yml.backup`
3. **Added TTS ingress rule** for `tts.hivemindai.org` → `http://localhost:8001`
4. **Created DNS record** using `cloudflared tunnel route dns`
5. **Restarted tunnel** to apply new configuration

## DNS Records

Cloudflare automatically created:
```
Type: CNAME
Name: tts.hivemindai.org
Target: [tunnel-id].cfargotunnel.com
Proxied: Yes
```

## Verification

### TTS Service (Working ✅)
```bash
# Health check
curl https://tts.hivemindai.org/health

# Response
{"status":"ok","model":"Qwen3-TTS-12Hz-1.7B-VoiceDesign","model_loaded":true}
```

```bash
# Available voices
curl https://tts.hivemindai.org/voices

# Returns list of advisor voice profiles
```

### STT Service Status
- **Local service**: Not currently running on port 8000
- **Tunnel route**: Configured but returns 502 (expected when service is down)
- **Note**: STT service was not running before TTS tunnel configuration

## Managing the Tunnel

### Check Status
```bash
# Check if cloudflared is running
tasklist | findstr cloudflared
```

### Restart Tunnel
```bash
# Stop existing processes
taskkill /F /IM cloudflared.exe

# Start tunnel
"C:/Program Files (x86)/cloudflared/cloudflared.exe" tunnel run voice-type
```

### View Tunnel Info
```bash
"C:/Program Files (x86)/cloudflared/cloudflared.exe" tunnel list
"C:/Program Files (x86)/cloudflared/cloudflared.exe" tunnel info voice-type
```

## Security Notes

- Tunnel uses Cloudflare's authentication and automatically handles TLS
- No need to expose ports 8000 or 8001 directly to the internet
- All traffic routes through Cloudflare's network
- Config file and credentials stored in `C:\Users\Administrator\.cloudflared\`

## Next Steps

1. **Phase 4**: Integrate TTS API into Next.js app
2. **Phase 5**: Add TTS controls to dashboard UI

## Testing Endpoints

```bash
# Local testing
curl http://localhost:8001/health
curl http://localhost:8001/voices

# External testing (through Cloudflare)
curl https://tts.hivemindai.org/health
curl https://tts.hivemindai.org/voices

# Generate speech (POST)
curl -X POST https://tts.hivemindai.org/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "voice_description": "A clear, friendly voice"}'
```

## Troubleshooting

### Tunnel not responding
1. Check if cloudflared is running: `tasklist | findstr cloudflared`
2. Check if TTS server is running: `curl http://localhost:8001/health`
3. Restart tunnel (see "Managing the Tunnel" above)

### Config changes not taking effect
1. Stop cloudflared processes
2. Edit config file
3. Restart tunnel
4. Wait 10-15 seconds for DNS propagation

### 502 Bad Gateway
- Usually means local service (8000 or 8001) is not running
- Start the appropriate server (STT or TTS)
- Tunnel route is correct but service is unavailable

---

**Configuration Date**: 2026-01-23
**Verified Working**: ✅ TTS tunnel operational
**Status**: Ready for Next.js integration (Phase 4)
