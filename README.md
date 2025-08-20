# 🎰 T&T Cashpot Data App

A beautiful, offline-first mobile application for Trinidad & Tobago Cashpot lottery results, built with React Native, Expo, and Supabase.

![App Screenshot](assets/images/icon.png)

## 🌟 Features

### 🏠 **Home Screen**
- **Real-time Dashboard**: Live lottery results with beautiful visualizations
- **Latest Results Card**: Prominently displays the most recent draw with winning numbers
- **Statistics Overview**: Quick stats showing total draws, average jackpot, and total value
- **Pull-to-Refresh**: Swipe down to sync latest data from the server
- **Background Sync**: Automatic data synchronization in the background
- **Offline Support**: Works seamlessly without internet connection using cached data

### 📚 **Historical Results**
- **Complete Archive**: Browse all historical lottery draws with pagination
- **Advanced Search**: Search by draw numbers, dates, winning numbers, or any text
- **Smart Filtering**: Filter results by date range, jackpot amounts, and more
- **Efficient Pagination**: Loads 100 results at a time for optimal performance
- **Database Search**: Fast search using Supabase queries for large datasets
- **Load More**: Infinite scrolling with automatic data loading

### ⚙️ **Settings & Customization**
- **Theme Support**: Light, Dark, and Auto themes with system preference detection
- **Cache Management**: View cache information and manually clear data
- **Force Sync**: Manual synchronization option for immediate data updates
- **Developer Information**: Links to source code and support channels
- **Data Source Disclaimer**: Clear information about data sources and usage

### 🎨 **User Experience**
- **Beautiful Design**: Modern, intuitive interface with smooth animations
- **Responsive Layout**: Optimized for all screen sizes and orientations
- **Accessibility**: High contrast themes and readable typography
- **Error Handling**: Graceful error states with retry options
- **Loading States**: Smooth loading animations and skeleton screens

## 🏗️ Architecture

### **Frontend Stack**
- **React Native 0.79.1**: Cross-platform mobile development
- **Expo SDK 53**: Development platform with built-in tools
- **TypeScript 5.8.3**: Type-safe JavaScript development
- **Expo Router 5.0.2**: File-based routing system

### **Backend & Data**
- **Supabase**: Backend-as-a-Service with PostgreSQL database
- **SQLite**: Local caching and offline data storage
- **AsyncStorage**: Persistent local storage for app data

### **State Management**
- **React Context**: Theme management and global state
- **Custom Hooks**: Reusable logic for data fetching and caching
- **Service Layer**: Centralized business logic for lottery operations

### **UI Components**
- **Custom Components**: Reusable UI elements (LottoCard, NumberBall, etc.)
- **Lucide Icons**: Beautiful, consistent iconography
- **Linear Gradients**: Modern visual effects and depth
- **Responsive Design**: Adaptive layouts for different screen sizes

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Emulator
- Supabase account and project

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/surenjanath/nlcb-mobile-app.git
   cd nlcb-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the project root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Supabase Database Setup**
   - Follow the [Supabase Setup Guide](SUPABASE_SETUP.md)
   - Run the SQL schema from `sql_in_supabase.sql`
   - Migrate existing data using the Python migration script

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### **Database Migration (Optional)**
If you have existing SQLite data:
```bash
cd python_code
pip install -r requirements.txt
python migrate_to_supabase.py
```

## 📱 App Structure

### **File Organization**
```
project/
├── app/                    # Expo Router screens
│   ├── (tabs)/           # Tab-based navigation
│   │   ├── index.tsx     # Home screen
│   │   ├── historical.tsx # Historical results
│   │   └── settings.tsx  # Settings & info
│   ├── detail.tsx        # Draw detail view
│   └── _layout.tsx       # Root layout
├── components/            # Reusable UI components
├── services/             # Business logic & API calls
├── contexts/             # React Context providers
├── constants/            # App constants & themes
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── python_code/          # Data migration scripts
```

### **Key Components**

#### **LottoCard**
- Displays individual lottery results
- Shows winning numbers, draw date, and draw number
- Responsive design with proper spacing
- Touch feedback and accessibility

#### **NumberBall**
- Visual representation of lottery numbers
- Different sizes (small, medium, large)
- Special styling for power ball numbers
- Consistent with lottery aesthetics

#### **CustomTabBar**
- Floating tab navigation
- Beautiful glassmorphism design
- Smooth transitions between screens
- Active state indicators

#### **SyncStatusBar**
- Real-time sync status display
- Network connectivity indicators
- Error handling with retry options
- Progress tracking for sync operations

### **Services Architecture**

#### **LottoService**
- **Data Management**: CRUD operations for lottery results
- **Caching Strategy**: Offline-first approach with local storage
- **Sync Logic**: Intelligent incremental synchronization
- **Search & Filtering**: Advanced query capabilities
- **Error Handling**: Robust error management with fallbacks

#### **SupabaseClient**
- **Database Connection**: Secure connection to Supabase
- **Query Optimization**: Efficient data fetching with pagination
- **Connection Testing**: Health checks and error detection
- **Environment Validation**: Configuration verification

## 🎨 Design System

### **Color Palette**
- **Primary**: Vibrant purple (#7C3AED) for main actions
- **Secondary**: Warm amber (#F59E0B) for highlights
- **Accent**: Emerald green (#10B981) for success states
- **Neutral**: Sophisticated grays for text and backgrounds

### **Typography**
- **Headings**: Bold, modern fonts with proper hierarchy
- **Body Text**: Readable fonts optimized for mobile screens
- **Labels**: Clear, concise text for UI elements
- **Accessibility**: High contrast ratios for readability

### **Spacing & Layout**
- **Consistent Spacing**: 8px grid system for alignment
- **Responsive Margins**: Adaptive spacing for different screen sizes
- **Card Design**: Elevated cards with subtle shadows
- **Visual Hierarchy**: Clear information architecture

## 🔧 Technical Features

### **Performance Optimizations**
- **Lazy Loading**: Components load only when needed
- **Image Optimization**: Efficient image handling and caching
- **Memory Management**: Proper cleanup and resource management
- **Bundle Optimization**: Minimal bundle size with tree shaking

### **Offline Capabilities**
- **Local Caching**: SQLite database for offline data access
- **Smart Sync**: Incremental updates to minimize data transfer
- **Conflict Resolution**: Handles data conflicts gracefully
- **Cache Management**: Automatic cache cleanup and optimization

### **Data Synchronization**
- **Background Sync**: Automatic data updates in background
- **Incremental Updates**: Only syncs new or changed data
- **Retry Logic**: Automatic retry with exponential backoff
- **Progress Tracking**: Real-time sync progress indicators

### **Error Handling**
- **Graceful Degradation**: App continues working with cached data
- **User-Friendly Messages**: Clear error descriptions and solutions
- **Retry Mechanisms**: Easy recovery from temporary failures
- **Logging & Debugging**: Comprehensive error logging for developers

## 📊 Data Model

### **LottoResult Interface**
```typescript
interface LottoResult {
  date: string;           // YYYY-MM-DD format
  draw_num: number;       // Unique draw identifier
  numbers: string;        // Pipe-separated winning numbers
  power_ball: number;     // Power ball number
  multiplier: number;     // Power play multiplier
  jackpot: number;        // Jackpot amount in cents
  wins: number;           // Number of winners
}
```

### **Database Schema**
```sql
CREATE TABLE lotto_results (
  id BIGSERIAL PRIMARY KEY,
  draw_num INTEGER UNIQUE NOT NULL,
  date DATE NOT NULL,
  numbers TEXT NOT NULL,
  power_ball INTEGER NOT NULL,
  multiplier INTEGER NOT NULL,
  jackpot DECIMAL(15,2) NOT NULL,
  wins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Deployment

### **Development**
```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
```

### **Building**
```bash
expo build:android   # Build Android APK
expo build:ios       # Build iOS app
expo export --platform web  # Export for web
```

### **Publishing**
```bash
expo publish         # Publish to Expo
expo build:android --release  # Production Android build
```

## 🧪 Testing

### **Manual Testing**
- Test on different screen sizes
- Verify offline functionality
- Check theme switching
- Test search and filtering
- Validate error handling

### **Automated Testing**
```bash
npm test             # Run test suite
npm run test:watch   # Watch mode for development
npm run test:coverage # Coverage report
```

## 🔒 Security

### **Data Protection**
- **Environment Variables**: Sensitive data stored securely
- **API Key Management**: Secure handling of Supabase credentials
- **Input Validation**: All user inputs are validated
- **Error Sanitization**: No sensitive information in error messages

### **Privacy**
- **Local Storage**: User data stays on device
- **No Tracking**: No analytics or user tracking
- **Data Ownership**: Users control their cached data
- **Transparent**: Clear data source information

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Code Standards**
- Follow TypeScript best practices
- Use consistent formatting with Prettier
- Write meaningful commit messages
- Include proper documentation

### **Testing Guidelines**
- Test on multiple devices
- Verify offline functionality
- Check accessibility features
- Validate error scenarios

## 📱 Platform Support

### **iOS**
- **Minimum Version**: iOS 13.0+
- **Devices**: iPhone and iPad
- **Features**: Full native functionality
- **Performance**: Optimized for iOS devices

### **Android**
- **Minimum Version**: Android 6.0 (API 23)
- **Devices**: Phones and tablets
- **Features**: Full native functionality
- **Performance**: Optimized for Android devices

### **Web**
- **Browsers**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Responsive**: Mobile-first responsive design
- **PWA**: Progressive Web App capabilities
- **Performance**: Optimized for web platforms

## 🐛 Troubleshooting

### **Common Issues**

#### **App Won't Start**
- Check Node.js version (18+ required)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

#### **Supabase Connection Issues**
- Verify environment variables in `.env`
- Check Supabase project status
- Ensure database table exists
- Verify API key permissions

#### **Build Failures**
- Update Expo CLI: `npm install -g @expo/cli@latest`
- Clear Expo cache: `expo r -c`
- Check for conflicting dependencies

#### **Performance Issues**
- Enable Hermes engine in app.json
- Optimize images and assets
- Use production builds for testing
- Monitor memory usage

### **Debug Mode**
Enable detailed logging:
```typescript
// In services/lottoService.ts
console.log('🔍 Debug mode enabled');
```

## 📚 Additional Resources

### **Documentation**
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### **Community**
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://github.com/react-native-community)
- [Supabase Community](https://github.com/supabase/supabase)

### **Tools & Libraries**
- [Expo DevTools](https://docs.expo.dev/workflow/expo-dev-tools/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) for debugging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Background Photo**: Beautiful beach scene by [Pranay Arora](https://unsplash.com/@pranayyy7) on Unsplash
- **Icons**: [Lucide React Native](https://lucide.dev/) for beautiful iconography
- **Development**: Built with [Cursor](https://cursor.sh/) and powered by AI assistance
- **Data Source**: Lottery results from publicly available information

## 📞 Support

### **Developer Contact**
- **Email**: surenjanath.singh@gmail.com
- **WhatsApp**: +1 (868) 263-9980
- **LinkedIn**: [Surenjanath Singh](https://www.linkedin.com/in/surenjanath/)

### **Project Links**
- **GitHub Repository**: [nlcb-mobile-app](https://github.com/surenjanath/nlcb-mobile-app)
- **Web Scraper**: [CashPot_Automated_Scraper](https://github.com/surenjanath/CashPot_Automated_Scraper)
- **Fiverr Services**: [Professional Web Scraping](https://www.fiverr.com/surenjanath/webscrape-any-website-for-you-at-a-price)
- **Support**: [Buy Me a Coffee](https://www.buymeacoffee.com/surenjanath)

---

**✨ Built with love for the Trinidad & Tobago community! ✨**

*This app is not affiliated with the National Lotteries Control Board (NLCB) or any official lottery organization. All lottery data is sourced from publicly available information for informational purposes only.*
