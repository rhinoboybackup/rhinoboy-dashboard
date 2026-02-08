# 📱 Mobile Testing Guide - iPhone 15

## Quick Start

```bash
cd /Users/rhinoboybot_virtual/.openclaw/workspace/projects/rhinoboy-dashboard/app
npm run dev
```

Then open http://localhost:3001 in Safari on iPhone 15 (or simulator)

## Testing Scenarios

### 1. **Login Screen**
- [ ] Logo displays at 96x96px
- [ ] Glass card is centered and readable
- [ ] Google sign-in button is 52px tall (easy to tap)
- [ ] Button has scale feedback on tap
- [ ] Safe areas respected (no notch overlap)

### 2. **Tools Page (Main Test)**
- [ ] Header "Tools" is large and readable (30px)
- [ ] "Add Tool" button visible in top right
- [ ] Filter tabs scroll horizontally
- [ ] Cards display in single column
- [ ] **Capability tags visible** (blue, purple, amber pills)
- [ ] Tags wrap properly on second line
- [ ] Glass effect is smooth and performant
- [ ] Cards scale slightly on tap
- [ ] All buttons ≥44px touch target

### 3. **Tool Card Details**
Check a tool card (e.g., "Google / Gemini"):
- [ ] Icon is visible and sharp
- [ ] Name and description readable
- [ ] **Tags display below description:**
  - Vision (purple)
  - Multimodal (pink)
  - Reasoning (amber)
  - Conversation (emerald)
  - Cost-effective (teal)
  - Fast (orange)
- [ ] Edit/delete buttons are 44x44px
- [ ] API key section is readable
- [ ] Eye/copy buttons work smoothly

### 4. **Mobile Navigation**
- [ ] Bottom nav is always visible
- [ ] Safe area padding prevents home bar overlap
- [ ] 6 icons: Files, Cron, Chat, Tools, Status, Settings
- [ ] Active tab is bold with label
- [ ] Inactive tabs are lighter gray
- [ ] Icons are 22px
- [ ] Smooth transitions between pages

### 5. **Add Tool Modal**
- [ ] Modal slides up from bottom
- [ ] Rounded top corners
- [ ] Glass backdrop blur
- [ ] Tool list is scrollable
- [ ] Touch targets are large enough
- [ ] Keyboard doesn't cover inputs
- [ ] Cancel/Add buttons are accessible

### 6. **Performance**
- [ ] No lag when scrolling
- [ ] Blur effects render smoothly
- [ ] Animations are 60fps
- [ ] No 300ms tap delay
- [ ] Page loads in <2 seconds

### 7. **Orientation**
- [ ] Portrait mode: single column
- [ ] Landscape mode: works (optional 2-column)
- [ ] Bottom nav remains functional
- [ ] No horizontal scroll

## Visual Checklist

### Colors & Contrast
- [ ] Text is readable on glass backgrounds
- [ ] Tags have sufficient contrast
- [ ] Active states are obvious
- [ ] Disabled states are clear

### Spacing
- [ ] No cramped elements
- [ ] Generous whitespace (Apple style)
- [ ] Consistent padding (16px mobile)
- [ ] Clear visual hierarchy

### Typography
- [ ] San Francisco font renders correctly
- [ ] Headings are bold and prominent
- [ ] Body text is 16px minimum (no zoom)
- [ ] Labels are uppercase and tracked

### Glassmorphism
- [ ] Frosted glass effect visible
- [ ] Translucency shows background gradient
- [ ] Subtle shadows add depth
- [ ] Inset highlights on cards

## iPhone 15 Specifics

**Screen:** 390 × 844 points  
**Notch:** Safe area top = ~59px  
**Home indicator:** Safe area bottom = ~34px  

### Safe Area Test
1. Open Tools page
2. Check top: Should have padding from status bar
3. Scroll to bottom
4. Bottom nav should sit above home indicator
5. Tap bottom nav buttons - all should be reachable

## Tag Color Reference

Quick visual check - each tool should show colored tags:

**Replicate (🤖):**
- 🟢 audio (green)
- 🟣 video (indigo)
- 🌹 image (rose)
- 🟩 cost-effective (teal)
- 🟪 creative (fuchsia)

**Google/Gemini (🔮):**
- 🟣 vision (purple)
- 🩷 multimodal (pink)
- 🟡 reasoning (amber)
- 🟢 conversation (emerald)
- 🟩 cost-effective (teal)
- 🟠 fast (orange)

**Anthropic (🅰️):**
- 🔵 coding (blue)
- 🟣 vision (purple)
- 🟡 reasoning (amber)
- 🟢 conversation (emerald)
- ⚫ production (slate)
- 🔴 powerful (red)

## Known Issues / Limitations

- Build warning about chunk size (>500KB) - non-critical
- Browser control not available for automated screenshots
- PWA features not yet implemented
- Dark mode not yet implemented

## Success Criteria

✅ All touch targets ≥44px  
✅ No horizontal scroll (portrait)  
✅ Glassmorphism visible and smooth  
✅ Tags display with correct colors  
✅ Safe areas respected  
✅ No tap delay  
✅ Smooth animations  

## Screenshots to Capture

If testing manually, capture these:
1. Login screen
2. Tools page - full view
3. Tools page - scroll to see tags
4. Single tool card close-up (with tags visible)
5. Filter tabs horizontal scroll
6. Add tool modal
7. Bottom navigation active/inactive states

---

**Last Updated:** February 7, 2026  
**Testing Platform:** Safari on iOS 17.3+  
**Target Device:** iPhone 15 (390×844pt)
