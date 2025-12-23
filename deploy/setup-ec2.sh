#!/bin/bash

# EC2 Setup Script for Weather Platform
# Run this script on a fresh Ubuntu 22.04 EC2 instance

set -e  # Exit on error

echo "========================================="
echo "Weather Platform - EC2 Setup Script"
echo "========================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Install Node.js 20
echo "📦 Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js installed"
else
    echo "✅ Node.js already installed"
fi

# Install PM2
echo "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 already installed"
fi

# Install Nginx
echo "📦 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    echo "✅ Nginx installed"
else
    echo "✅ Nginx already installed"
fi

# Install Git
echo "📦 Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    echo "✅ Git installed"
else
    echo "✅ Git already installed"
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p ~/weather-platform/logs

# Print versions
echo ""
echo "========================================="
echo "✅ Setup Complete! Installed versions:"
echo "========================================="
docker --version
docker-compose --version
node --version
npm --version
pm2 --version
nginx -v
git --version

echo ""
echo "========================================="
echo "📝 Next Steps:"
echo "========================================="
echo "1. Clone your repository:"
echo "   git clone <your-repo-url> ~/weather-platform"
echo ""
echo "2. For Docker Compose deployment:"
echo "   cd ~/weather-platform"
echo "   cp .env.docker .env.production"
echo "   nano .env.production  # Edit with your values"
echo "   docker-compose --env-file .env.production up -d"
echo ""
echo "3. For PM2 deployment:"
echo "   cd ~/weather-platform"
echo "   bash deploy/deploy.sh"
echo ""
echo "4. Setup Nginx reverse proxy (optional)"
echo ""
echo "⚠️  IMPORTANT: Logout and login again for Docker group changes to take effect!"
echo "========================================="
