# Deployment Guide - Vosita Slots Management Application

## Overview

This guide provides comprehensive instructions for deploying the Vosita Slots Management Application across different platforms and environments.

## Prerequisites

Before deploying the application, ensure you have the following:

- Node.js (version 16 or higher)
- npm or yarn package manager
- Expo CLI (for Expo-specific deployments)
- Git (for version control)
- Platform-specific development tools (Xcode for iOS, Android Studio for Android)

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd vosita-slots-app
npm install
```

### 2. Start Development Server

```bash
npm start
```

This will start the Expo development server with the following options:
- **Web**: Access at `http://localhost:8081`
- **iOS**: Use Expo Go app or iOS Simulator
- **Android**: Use Expo Go app or Android Emulator

### 3. Platform-Specific Development

#### Web Development
```bash
npm run web
```

#### iOS Development (macOS only)
```bash
npm run ios
```

#### Android Development
```bash
npm run android
```

## Production Deployment Options

### Option 1: Expo Application Services (EAS) - Recommended

EAS provides the most comprehensive deployment solution for Expo applications.

#### Setup EAS

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

#### Build for Production

1. **iOS Build**
   ```bash
   eas build --platform ios
   ```

2. **Android Build**
   ```bash
   eas build --platform android
   ```

3. **All Platforms**
   ```bash
   eas build --platform all
   ```

#### Submit to App Stores

1. **iOS App Store**
   ```bash
   eas submit --platform ios
   ```

2. **Google Play Store**
   ```bash
   eas submit --platform android
   ```

### Option 2: Expo Classic Build (Legacy)

For projects that need to use the classic build service:

```bash
expo build:ios
expo build:android
```

### Option 3: Web Deployment

#### Build for Web

```bash
npm run web:build
```

#### Deploy to Static Hosting

The web build can be deployed to any static hosting service:

1. **Netlify**
   - Connect your Git repository
   - Set build command: `npm run web:build`
   - Set publish directory: `web-build`

2. **Vercel**
   - Import your Git repository
   - Vercel will automatically detect the Expo configuration

3. **GitHub Pages**
   ```bash
   npm install --save-dev gh-pages
   npm run web:build
   npx gh-pages -d web-build
   ```

## Environment Configuration

### Development Environment

Create a `.env.local` file for development-specific configuration:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENVIRONMENT=development
```

### Production Environment

For production builds, configure environment variables in your deployment platform:

```env
EXPO_PUBLIC_API_URL=https://api.yourapp.com
EXPO_PUBLIC_ENVIRONMENT=production
```

## Deep Linking Configuration

### Universal Links (iOS) and App Links (Android)

1. **Configure app.json**
   ```json
   {
     "expo": {
       "scheme": "vosita-slots",
       "web": {
         "bundler": "metro"
       },
       "ios": {
         "associatedDomains": ["applinks:yourapp.com"]
       },
       "android": {
         "intentFilters": [
           {
             "action": "VIEW",
             "autoVerify": true,
             "data": [
               {
                 "scheme": "https",
                 "host": "yourapp.com"
               }
             ],
             "category": ["BROWSABLE", "DEFAULT"]
           }
         ]
       }
     }
   }
   ```

2. **Test Deep Linking**
   ```bash
   npx uri-scheme open vosita-slots://slots-view?timezone=America/Chicago --ios
   npx uri-scheme open vosita-slots://slots-view?timezone=America/Chicago --android
   ```

## Performance Optimization

### Bundle Size Optimization

1. **Analyze Bundle**
   ```bash
   npx expo install @expo/webpack-config
   npx webpack-bundle-analyzer web-build/static/js/*.js
   ```

2. **Code Splitting**
   Implement dynamic imports for large components:
   ```typescript
   const SlotsViewScreen = React.lazy(() => import('./SlotsViewScreen'));
   ```

### Image Optimization

1. **Optimize Assets**
   ```bash
   npx expo optimize
   ```

2. **Use WebP Format**
   Configure automatic WebP conversion in `metro.config.js`

## Monitoring and Analytics

### Crash Reporting

1. **Sentry Integration**
   ```bash
   npm install @sentry/react-native
   ```

2. **Configure Sentry**
   ```typescript
   import * as Sentry from '@sentry/react-native';
   
   Sentry.init({
     dsn: 'YOUR_SENTRY_DSN',
   });
   ```

### Performance Monitoring

1. **Flipper Integration**
   ```bash
   npm install react-native-flipper
   ```

2. **Performance Metrics**
   Implement custom performance tracking for slot generation and rendering.

## Security Considerations

### Code Obfuscation

For production builds, consider code obfuscation:

```bash
npm install --save-dev metro-react-native-babel-preset
```

### API Security

1. **Environment Variables**
   Never commit sensitive data to version control
   
2. **Certificate Pinning**
   Implement certificate pinning for API communications

### Data Protection

1. **Secure Storage**
   ```bash
   expo install expo-secure-store
   ```

2. **Biometric Authentication**
   ```bash
   expo install expo-local-authentication
   ```

## Continuous Integration/Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build for EAS
        run: eas build --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### Automated Testing

1. **Unit Tests**
   ```bash
   npm test
   ```

2. **E2E Tests with Detox**
   ```bash
   npm install --save-dev detox
   detox test
   ```

## Troubleshooting

### Common Issues

1. **Metro Bundler Issues**
   ```bash
   npx expo start --clear
   ```

2. **Dependency Conflicts**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **iOS Build Issues**
   - Ensure Xcode is updated
   - Clear derived data
   - Check provisioning profiles

4. **Android Build Issues**
   - Update Android SDK
   - Check Gradle configuration
   - Verify signing certificates

### Debug Mode

Enable debug mode for troubleshooting:

```bash
expo start --dev-client
```

## Maintenance

### Regular Updates

1. **Expo SDK Updates**
   ```bash
   expo upgrade
   ```

2. **Dependency Updates**
   ```bash
   npm update
   npm audit fix
   ```

3. **Security Patches**
   Regularly check for and apply security updates

### Monitoring

1. **App Store Reviews**
   Monitor app store reviews for user feedback

2. **Crash Reports**
   Regularly review crash reports and fix issues

3. **Performance Metrics**
   Monitor app performance and optimize as needed

## Support and Documentation

### Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Documentation](https://docs.expo.dev/eas/)

### Getting Help

1. **Expo Forums**
   Community support and discussions

2. **GitHub Issues**
   Report bugs and feature requests

3. **Stack Overflow**
   Technical questions and solutions

---

This deployment guide provides comprehensive instructions for deploying the Vosita Slots Management Application across different platforms and environments. Follow the appropriate sections based on your deployment requirements and target platforms.

