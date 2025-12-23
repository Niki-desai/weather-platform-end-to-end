#!/bin/bash

# Application Deployment Script for PM2
# Run this after setup-ec2.sh

set -e  # Exit on error

echo "========================================="
echo "Weather Platform - Deployment Script"
echo "========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from project root."
    exit 1
fi

# Install root dependencies (if any)
echo "📦 Installing root dependencies..."
npm install --production=false

# Install API Gateway dependencies
echo "📦 Installing API Gateway dependencies..."
cd apps/api-gateway
npm install --production=false
cd ../..

# Install Worker Service dependencies
echo "📦 Installing Worker Service dependencies..."
cd apps/worker-service
npm install --production=false
cd ../..

# Build API Gateway
echo "🔨 Building API Gateway..."
cd apps/api-gateway
npm run build
cd ../..

# Build Worker Service
echo "🔨 Building Worker Service..."
cd apps/worker-service
npm run build
cd ../..

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found"
    echo "Creating from .env template..."
    cp .env .env.production
    echo "⚠️  Please edit .env.production with production values!"
    exit 1
fi

# Load environment variables
echo "🔧 Loading environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

# Stop existing PM2 processes
echo "🛑 Stopping existing PM2 processes..."
pm2 delete all || true

# Start services with PM2
echo "🚀 Starting services with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
echo "💾 Saving PM2 process list..."
pm2 save

# Setup PM2 startup script
echo "🔧 Setting up PM2 startup..."
pm2 startup | tail -n 1 | bash || true

# Show PM2 status
echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
pm2 status

echo ""
echo "📊 Useful PM2 Commands:"
echo "  pm2 status          - View all processes"
echo "  pm2 logs            - View all logs"
echo "  pm2 logs api-gateway - View API Gateway logs"
echo "  pm2 monit           - Monitor resources"
echo "  pm2 restart all     - Restart all processes"
echo "  pm2 stop all        - Stop all processes"
echo ""
echo "🌐 API should be running on http://localhost:3000"
echo "   Test: curl http://localhost:3000/health"
echo "========================================="
