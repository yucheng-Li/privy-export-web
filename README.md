# Privy Export Web

A minimal Vite + React application that uses Privy React SDK to export a wallet private key and send it to React Native via WebView.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your Privy App ID:
   - Create a `.env` file in the root of this project
   - Add: `VITE_PRIVY_APP_ID=your_privy_app_id_here`
   - Or update the `YOUR_PRIVY_APP_ID` placeholder in `App.jsx`

## Build

1. Build the project:
   ```bash
   npm run build
   ```

2. The output will be in the `dist/` folder

3. Copy the entire `dist/` folder into your React Native project:
   ```
   react-native-project/assets/privy-export/
   ```

   The final structure should be:
   ```
   react-native-project/assets/privy-export/index.html
   react-native-project/assets/privy-export/assets/*.js
   react-native-project/assets/privy-export/assets/*.css
   ```

## Usage in React Native

Load the HTML file in your WebView:

```javascript
<WebView
  source={{ uri: Platform.OS === 'ios' 
    ? 'file://' + RNFS.MainBundlePath + '/privy-export/index.html'
    : 'file:///android_asset/privy-export/index.html'
  }}
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'export-wallet') {
      console.log('Private Key:', data.privateKey);
      // Handle the private key
    }
  }}
/>
```

## Development

Run the development server:

```bash
npm run dev
```
