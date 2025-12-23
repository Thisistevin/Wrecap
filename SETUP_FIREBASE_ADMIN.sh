#!/bin/bash

echo "🔧 Firebase Admin SDK Setup Helper"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating it..."
    touch .env.local
fi

echo "📋 Step 1: Download Service Account JSON"
echo "   → Open: https://console.firebase.google.com/project/wrecap-cb21d/settings/serviceaccounts/adminsdk"
echo "   → Click 'Generate new private key'"
echo "   → Save the JSON file"
echo ""
read -p "   Press Enter when you've downloaded the file..."

echo ""
echo "📋 Step 2: Choose configuration method"
echo ""
echo "   Option A: Use environment variable (RECOMMENDED)"
echo "   Option B: Use file path"
echo ""
read -p "   Choose (A/B): " choice

if [ "$choice" = "A" ] || [ "$choice" = "a" ]; then
    echo ""
    echo "📝 Option A: Environment Variable"
    echo ""
    read -p "   Enter the path to the downloaded JSON file: " json_path
    
    if [ ! -f "$json_path" ]; then
        echo "   ❌ File not found: $json_path"
        exit 1
    fi
    
    # Read JSON and convert to single line
    json_content=$(cat "$json_path" | tr -d '\n' | sed "s/'/\\\'/g")
    
    # Remove old GOOGLE_APPLICATION_CREDENTIALS if exists
    sed -i.bak '/^GOOGLE_APPLICATION_CREDENTIALS=/d' .env.local
    
    # Add FIREBASE_SERVICE_ACCOUNT_KEY
    echo "" >> .env.local
    echo "# Firebase Admin SDK Credentials" >> .env.local
    echo "FIREBASE_SERVICE_ACCOUNT_KEY='$json_content'" >> .env.local
    
    echo ""
    echo "✅ Added FIREBASE_SERVICE_ACCOUNT_KEY to .env.local"
    echo "   (Backup saved as .env.local.bak)"
    
elif [ "$choice" = "B" ] || [ "$choice" = "b" ]; then
    echo ""
    echo "📝 Option B: File Path"
    echo ""
    read -p "   Enter the path to the downloaded JSON file: " json_path
    
    if [ ! -f "$json_path" ]; then
        echo "   ❌ File not found: $json_path"
        exit 1
    fi
    
    # Copy file to project root
    filename=$(basename "$json_path")
    cp "$json_path" "./$filename"
    
    # Remove old FIREBASE_SERVICE_ACCOUNT_KEY if exists
    sed -i.bak '/^FIREBASE_SERVICE_ACCOUNT_KEY=/d' .env.local
    
    # Add GOOGLE_APPLICATION_CREDENTIALS
    echo "" >> .env.local
    echo "# Firebase Admin SDK Credentials" >> .env.local
    echo "GOOGLE_APPLICATION_CREDENTIALS=./$filename" >> .env.local
    
    echo ""
    echo "✅ Copied file to project root and added GOOGLE_APPLICATION_CREDENTIALS to .env.local"
    echo "   (Backup saved as .env.local.bak)"
else
    echo "   ❌ Invalid choice"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart your dev server: npm run dev"
echo "   2. Test the application"
echo ""
echo "💡 Tip: If you see errors, check QUICK_SETUP.md for troubleshooting"

