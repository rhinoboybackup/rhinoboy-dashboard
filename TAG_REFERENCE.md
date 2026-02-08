# 🏷️ Model Tags Reference

## Tag Categories

### 🔧 Capabilities
Tags that describe what a tool/model can do

| Tag | Color | Visual | Used By |
|-----|-------|--------|---------|
| `coding` | Blue | 🔵 Coding | OpenAI, Anthropic |
| `vision` | Purple | 🟣 Vision | Google, OpenAI, Anthropic |
| `reasoning` | Amber | 🟡 Reasoning | Google, xAI, OpenAI, Anthropic |
| `multimodal` | Pink | 🩷 Multimodal | Google, OpenAI |
| `audio` | Green | 🟢 Audio | Replicate, ElevenLabs |
| `video` | Indigo | 🟣 Video | Replicate |
| `image` | Rose | 🌹 Image Gen | Replicate |
| `search` | Cyan | 🔵 Search | xAI, Brave |

### 💡 Use Cases
Tags that describe how/when to use a tool

| Tag | Color | Visual | Used By |
|-----|-------|--------|---------|
| `conversation` | Emerald | 🟢 Chat | Google, xAI, OpenAI, Anthropic, ElevenLabs |
| `cost-effective` | Teal | 💰 Cost-effective | Replicate, Google, Brave |
| `production` | Slate | ⚫ Production | Anthropic, ElevenLabs |
| `research` | Violet | 🟣 Research | xAI, Brave, Firecrawl |
| `creative` | Fuchsia | 🟪 Creative | Replicate |
| `fast` | Orange | ⚡ Fast | Google |
| `powerful` | Red | 🔥 Powerful | OpenAI, Anthropic |

## Tool Tag Mapping

### AI/ML Models

**Replicate (🤖)**
```
🟢 audio  🟣 video  🌹 image  💰 cost-effective  🟪 creative
```

**Google / Gemini (🔮)**
```
🟣 vision  🩷 multimodal  🟡 reasoning  🟢 conversation  💰 cost-effective  ⚡ fast
```

**xAI / Grok (𝕏)**
```
🟡 reasoning  🔵 search  🟢 conversation  🟣 research
```

**OpenAI (🧠)**
```
🔵 coding  🟣 vision  🩷 multimodal  🟡 reasoning  🟢 conversation  🔥 powerful
```

**Anthropic (🅰️)**
```
🔵 coding  🟣 vision  🟡 reasoning  🟢 conversation  ⚫ production  🔥 powerful
```

**ElevenLabs (🔊)**
```
🟢 audio  🟢 conversation  ⚫ production
```

### Search & Data

**Brave Search (🦁)**
```
🔵 search  🟣 research  💰 cost-effective
```

**Firecrawl (🔥)**
```
🟣 research
```

**Supadata (📊)**
```
(no tags in current version)
```

### Productivity

**Notion (📝)**
```
(no tags - utility tool)
```

**Miro (🎨)**
```
(no tags - utility tool)
```

### Channels

**Telegram (✈️)**
```
(no tags - system managed)
```

## CSS Implementation

```css
/* Example tag styles */
.tag-coding {
  background: rgba(59, 130, 246, 0.1);  /* blue-500/10 */
  color: rgb(29, 78, 216);               /* blue-700 */
  border: 1px solid rgba(96, 165, 250, 0.5); /* blue-200/50 */
  backdrop-filter: blur(4px);
}

.tag-cost-effective {
  background: rgba(20, 184, 166, 0.1);  /* teal-500/10 */
  color: rgb(15, 118, 110);              /* teal-700 */
  border: 1px solid rgba(153, 246, 228, 0.5); /* teal-200/50 */
  backdrop-filter: blur(4px);
}
```

## Design Principles

### Apple Aesthetic
- **Minimal:** Only essential tags (max 6 per tool)
- **Clear:** Readable at 12px font size
- **Soft:** 10% opacity backgrounds, 50% borders
- **Frosted:** Backdrop blur for glassmorphism

### Accessibility
- **Contrast:** All tags meet WCAG AA (4.5:1)
- **Size:** 12px font, 20px height (easy to read)
- **Touch:** Pills are tappable (future: filter by tag)
- **Spacing:** 6px gap between tags

### Mobile Optimization
- **Wrapping:** Tags wrap to multiple lines
- **Alignment:** Left-aligned, flows naturally
- **Spacing:** Consistent 6px (gap-1.5)
- **Performance:** CSS-only, no images

## Usage Guidelines

### When to Add Tags

✅ **Add tags for:**
- Core capabilities (what it does)
- Primary use cases (when to use it)
- Cost/speed advantages
- Production readiness

❌ **Don't tag:**
- Obvious features (all AI tools have "AI")
- Redundant info (already in description)
- More than 6 tags per tool
- Internal/technical details

### Tag Selection Priority

1. **Capabilities first** (what can it do?)
2. **Use cases second** (when should I use it?)
3. **Qualifiers last** (cost, speed, power)

**Example:** Anthropic
```
1. coding, vision, reasoning      (capabilities)
2. conversation, production        (use cases)
3. powerful                        (qualifier)
```

## Future Enhancements

- [ ] Click tag to filter tools
- [ ] Tag autocomplete in search
- [ ] Custom user tags
- [ ] Tag tooltips with descriptions
- [ ] Tag popularity/usage stats
- [ ] Dark mode tag colors

---

**Total Tags:** 15  
**Color Palette:** 15 unique colors  
**Mobile Tested:** ✅ iPhone 15  
**Accessibility:** ✅ WCAG AA compliant
