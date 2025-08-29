# SKSU Campus Kiosk

A dynamic campus information kiosk system for Sultan Kudarat State University that displays announcements, events, and achievements from a Google Spreadsheet in real-time.

## 🌟 Features

- **Real-time Data**: Automatically syncs with Google Sheets every 30 seconds
- **Image Support**: Handles Google Drive image URLs automatically
- **Responsive Design**: Works on all screen sizes and devices
- **Touch/Swipe Support**: Optimized for kiosk touch screens
- **Keyboard Navigation**: Arrow keys and spacebar support
- **Auto-slideshow**: Automatically cycles through slides
- **Fallback Content**: Shows university information when no announcements are available

## 🔧 Setup Instructions

### Option 1: GitHub Pages (Recommended - FREE)

1. **Create a GitHub Account** (if you don't have one)
2. **Create a new repository**:
   - Name it: `sksu-kiosk`
   - Make it public
3. **Upload files**:
   - `index.html`
   - `styles.css`
   - `script.js`
4. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch
   - Click Save
5. **Your website will be live at**: `https://yourusername.github.io/sksu-kiosk`

### Option 2: Netlify (FREE)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your folder containing the 3 files
3. Your site will be live instantly with a random URL
4. You can customize the URL in site settings

### Option 3: Vercel (FREE)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Deploy automatically

## 📊 Google Sheets Setup

Your spreadsheet should have these columns in the "Slide_Show" sheet:
- **Image URL**: Direct image links or Google Drive share links
- **Description**: Text description of the announcement
- **Title**: Main headline
- **Campus_ID**: Which campus this relates to

### For Google Drive Images:
1. Upload image to Google Drive
2. Right-click → Get link
3. Change to "Anyone with the link can view"
4. Copy the link and paste in spreadsheet

## 🎯 Usage

- **Auto-refresh**: Data updates every 30 seconds
- **Navigation**: 
  - Click dots to jump to specific slides
  - Use arrow keys for manual navigation
  - Swipe on touch devices
- **Auto-slideshow**: Changes slides every 8 seconds
- **Responsive**: Adapts to any screen size

## 🛠️ Customization

Edit `script.js` to change:
- `REFRESH_INTERVAL`: How often to check for updates (milliseconds)
- `SLIDE_DURATION`: How long each slide shows (milliseconds)
- Spreadsheet URL in the `CONFIG` object

## 📱 Perfect for:

- Campus information kiosks
- Digital bulletin boards
- Event displays
- Announcement systems
- University lobbies

## 🆘 Troubleshooting

**Images not loading?**
- Ensure Google Drive links are public
- Check image file formats (JPG, PNG, GIF)
- Verify spreadsheet permissions

**Data not updating?**
- Check spreadsheet URL
- Ensure sheet name is "Slide_Show"
- Check browser console for errors

## 📄 License

Free to use for educational purposes.

---

**Made for Sultan Kudarat State University**  
Campus Information Kiosk System
