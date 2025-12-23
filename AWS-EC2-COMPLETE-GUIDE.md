# Complete AWS EC2 Deployment Guide - Weather Platform

**Complete step-by-step guide based on actual deployment experience**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Launch EC2 Instance](#step-1-launch-ec2-instance)
3. [Configure Security Group](#step-2-configure-security-group)
4. [Connect to EC2](#step-3-connect-to-ec2)
5. [Install Dependencies](#step-4-install-dependencies)
6. [Clone and Configure](#step-5-clone-and-configure)
7. [Build Docker Images](#step-6-build-docker-images)
8. [Start Services](#step-7-start-services)
9. [Setup Nginx](#step-8-setup-nginx-optional)
10. [Testing](#step-9-testing)
11. [Troubleshooting](#troubleshooting)

---

## 🚀 Deployment Approach: Docker Compose vs PM2

This guide uses **Docker Compose** for deployment. Here's why:

### **What We're Using: Docker Compose** ✅

All services run in Docker containers with one command:
```bash
docker-compose --env-file .env.production up -d
```

**Includes:**
- API Gateway (containerized)
- Worker Service (containerized)
- Redis, PostgreSQL, Kafka, RabbitMQ (all containerized)

**Pros:**
- ✅ Simple setup - one command starts everything
- ✅ Portable - works on any machine
- ✅ Free tier friendly - no managed services needed
- ✅ Isolated environments

**Cons:**
- ❌ Higher memory usage
- ❌ May be slower on t2.micro

### **Alternative: PM2 (Not Used Here)**

PM2 runs Node.js apps directly on the server without Docker:
```bash
pm2 start ecosystem.config.js --env production
```

**When to use PM2:**
- Running on very small instances (512MB RAM)
- Using AWS managed services (RDS, ElastiCache)
- Need advanced process management
- Want better performance on limited resources

**Note:** We created PM2 config files (`ecosystem.config.js`) but chose Docker Compose for simplicity and completeness.

---

## Prerequisites

- ✅ AWS Account (Free Tier)
- ✅ GitHub repository with your code
- ✅ AWS credentials (Access Key ID, Secret Access Key)
- ✅ S3 bucket created
- ✅ SSH key pair downloaded (.pem file)

---

## Step 1: Launch EC2 Instance

### Option A: AWS Console (Recommended)

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **"Launch Instance"**
3. Configure:
   - **Name**: `weather-platform`
   - **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS (Free tier eligible)
   - **Instance type**: **t2.micro** or **t3.micro** ⚠️ MUST BE FREE TIER
   - **Key pair**: Create new (e.g., `weather-platform-key`) or use existing
   - **Storage**: 30 GB gp3 (free tier limit)
4. Click **"Launch Instance"**

### Option B: AWS CLI

```bash
# Amazon Linux 2023
aws ec2 run-instances \
  --image-id ami-0b3c832b6b7289e44 \
  --instance-type t3.micro \
  --key-name weather-platform-key \
  --associate-public-ip-address \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=weather-platform}]' \
  --count 1

# Ubuntu 22.04 (use appropriate AMI for your region)
aws ec2 run-instances \
  --image-id ami-xxxxxxxxx \
  --instance-type t2.micro \
  --key-name weather-platform-key \
  --associate-public-ip-address \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=weather-platform}]' \
  --count 1
```

**Note your EC2 Public IP** (e.g., `13.239.169.17`)

---

## Step 2: Configure Security Group

### AWS Console Method:

1. Go to [EC2 Security Groups](https://console.aws.amazon.com/ec2/#SecurityGroups)
2. Find your security group (e.g., `sg-000cbb8dfa6a5040e` or `default`)
3. Click **"Inbound rules"** tab → **"Edit inbound rules"**
4. Add these rules:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | My IP | SSH access |
| HTTP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | 443 | 0.0.0.0/0 | Secure web |
| Custom TCP | 3000 | 0.0.0.0/0 | API Gateway |

5. Click **"Save rules"**

### AWS CLI Method:

```bash
# Replace sg-XXXXXXXXX with your security group ID
aws ec2 authorize-security-group-ingress \
  --group-id sg-000cbb8dfa6a5040e \
  --ip-permissions \
    IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges='[{CidrIp=0.0.0.0/0}]' \
    IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges='[{CidrIp=0.0.0.0/0}]' \
    IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges='[{CidrIp=0.0.0.0/0}]' \
    IpProtocol=tcp,FromPort=3000,ToPort=3000,IpRanges='[{CidrIp=0.0.0.0/0}]'
```

---

## Step 3: Connect to EC2

### Windows (PowerShell):

```powershell
# Navigate to where you downloaded the .pem file
cd C:\Users\YourUsername\Downloads

# Connect (Amazon Linux)
ssh -i weather-platform-key.pem ec2-user@13.239.169.17

# Connect (Ubuntu)
ssh -i weather-platform-key.pem ubuntu@13.239.169.17
```

**If you get "UNPROTECTED PRIVATE KEY FILE" error:**

1. Right-click `weather-platform-key.pem` → Properties
2. Security tab → Advanced
3. "Disable inheritance" → "Remove all inherited permissions"
4. Add → Select your username → Full control → OK

### Linux/Mac:

```bash
# Set permissions
chmod 400 weather-platform-key.pem

# Connect (Amazon Linux)
ssh -i weather-platform-key.pem ec2-user@13.239.169.17

# Connect (Ubuntu)
ssh -i weather-platform-key.pem ubuntu@13.239.169.17
```

### Alternative: Browser-based SSH

1. AWS Console → EC2 → Instances
2. Select instance → Click **"Connect"**
3. Choose **"EC2 Instance Connect"** → **"Connect"**

---

## Step 4: Install Dependencies

### For Amazon Linux 2023:

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git

# Verify installations
docker --version
docker-compose --version
git --version

# IMPORTANT: Logout and login again
exit
```

**Then reconnect:**
```bash
ssh -i weather-platform-key.pem ec2-user@13.239.169.17
```

### For Ubuntu 22.04:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install -y git

# Verify installations
docker --version
docker-compose --version
git --version

# IMPORTANT: Logout and login again
exit
```

**Then reconnect:**
```bash
ssh -i weather-platform-key.pem ubuntu@13.239.169.17
```

---

## Step 5: Clone and Configure

```bash
# Clone your repository
git clone https://github.com/your-username/weather-platform-end-to-end.git
cd weather-platform-end-to-end

# Create production environment file
nano .env.production
```

**Paste this configuration:**

```bash
# API Gateway
PORT=3000
NODE_ENV=production

# Redis (Docker)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# RabbitMQ (Docker)
RABBITMQ_URL=amqp://rabbitmq:5672

# Kafka (Docker)
KAFKA_BROKER=kafka:9092

# PostgreSQL (Docker)
POSTGRES_USER=weather
POSTGRES_PASSWORD=YourSecurePassword123!
POSTGRES_DB=weather_db
DATABASE_URL=postgresql://weather:YourSecurePassword123!@postgres:5432/weather_db

# AWS S3 (Replace with your actual credentials)
AWS_S3_BUCKET=weather-platform-raw
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
```

**Save and exit:** `Ctrl + X`, `Y`, `Enter`

---

## Step 6: Build Docker Images

**⚠️ IMPORTANT:** Use legacy Docker build to avoid buildx issues

```bash
# Build images using legacy builder
DOCKER_BUILDKIT=0 docker-compose --env-file .env.production build

# This will take 2-5 minutes
# You'll see:
# ✔ Image weather-platform-end-to-end-api-gateway    Built
# ✔ Image weather-platform-end-to-end-worker-service Built
```

**If build fails**, try building manually:

```bash
# Build API Gateway
cd apps/api-gateway
DOCKER_BUILDKIT=0 docker build -t weather-platform-end-to-end-api-gateway .
cd ../..

# Build Worker Service
cd apps/worker-service
DOCKER_BUILDKIT=0 docker build -t weather-platform-end-to-end-worker-service .
cd ../..
```

---

## Step 7: Start Services

```bash
# Start all services
docker-compose --env-file .env.production up -d

# Wait for services to start
sleep 10

# Check status (all should show "Up")
docker-compose ps

# Expected output:
# NAME                                    STATUS
# weather-platform-end-to-end-api-gateway-1     Up
# weather-platform-end-to-end-worker-service-1  Up
# weather-platform-end-to-end-redis-1           Up
# weather-platform-end-to-end-postgres-1        Up
# weather-platform-end-to-end-rabbitmq-1        Up
# weather-platform-end-to-end-kafka-1           Up
# weather-platform-end-to-end-zookeeper-1       Up
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f worker-service
```

---

## Step 8: Setup Nginx (Optional)

### For Amazon Linux 2023:

```bash
# Install Nginx
sudo yum install -y nginx

# Create config
sudo nano /etc/nginx/conf.d/weather-platform.conf
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name 13.239.169.17;  # Replace with your EC2 IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Save and start Nginx:**

```bash
# Test config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### For Ubuntu 22.04:

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/weather-platform
```

**Paste the same Nginx configuration as above, then:**

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/weather-platform /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 9: Testing

### Test from EC2 Instance:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected: {"status":"ok","service":"api-gateway"}

# Test weather endpoint
curl http://localhost:3000/api/weather/London

# Should return weather data
```

### Test from Your Computer:

**Direct to API (port 3000):**
```bash
curl http://13.239.169.17:3000/health
curl http://13.239.169.17:3000/api/weather/London
```

**Through Nginx (port 80):**
```bash
curl http://13.239.169.17/health
curl http://13.239.169.17/api/weather/London
```

**Or open in browser:**
```
http://13.239.169.17:3000/health
http://13.239.169.17:3000/api/weather/London
http://13.239.169.17/health (if Nginx is setup)
```

---

## Troubleshooting

### 🔒 Security Group Issues

**Problem:** Can't SSH or access API

**Solution:**

1. Go to [EC2 Security Groups](https://console.aws.amazon.com/ec2/#SecurityGroups)
2. Find your security group (e.g., `sg-000cbb8dfa6a5040e`)
3. Click **"Inbound rules"** → **"Edit inbound rules"**
4. Add these rules:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | My IP | SSH access |
| HTTP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | 443 | 0.0.0.0/0 | Secure web |
| Custom TCP | 3000 | 0.0.0.0/0 | API Gateway |

**AWS CLI method:**
```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-XXXXXXXXX \
  --ip-permissions \
    IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges='[{CidrIp=0.0.0.0/0}]' \
    IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges='[{CidrIp=0.0.0.0/0}]' \
    IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges='[{CidrIp=0.0.0.0/0}]' \
    IpProtocol=tcp,FromPort=3000,ToPort=3000,IpRanges='[{CidrIp=0.0.0.0/0}]'
```

---

### 🔴 502 Bad Gateway Error

**Cause:** Nginx can't reach API Gateway (containers not running)

**Quick Diagnostics:**

```bash
# 1. Check if containers are running
docker-compose ps

# Expected: All services show "Up"
# If empty or "Exit", containers aren't running
```

**Step-by-Step Fix:**

```bash
# 1. Check container status
docker-compose ps

# 2. If not running, check logs
docker-compose logs api-gateway --tail=50

# 3. Test API directly (bypass Nginx)
curl http://localhost:3000/health

# 4. Check if port 3000 is listening
sudo netstat -tlnp | grep 3000
# or
sudo ss -tlnp | grep 3000

# 5. Check Nginx logs
sudo tail -20 /var/log/nginx/error.log
```

**Common Fixes:**

**Fix 1: Start containers**
```bash
docker-compose --env-file .env.production up -d
sleep 10
docker-compose ps
```

**Fix 2: Restart everything**
```bash
docker-compose --env-file .env.production down
docker-compose --env-file .env.production up -d
```

**Fix 3: Check environment file**
```bash
# Verify .env.production exists
ls -la .env.production

# Check contents
cat .env.production
```

**Fix 4: Rebuild images**
```bash
DOCKER_BUILDKIT=0 docker-compose --env-file .env.production build
docker-compose --env-file .env.production up -d
```

---

### 🐳 Docker Build Errors (buildx required)

**Error:** `compose build requires buildx 0.17 or later`

**Solution:** Use legacy Docker builder

```bash
# Build with legacy builder
DOCKER_BUILDKIT=0 docker-compose --env-file .env.production build

# Then start services
docker-compose --env-file .env.production up -d
```

**Alternative - Manual build:**
```bash
# Build API Gateway
cd apps/api-gateway
DOCKER_BUILDKIT=0 docker build -t weather-platform-end-to-end-api-gateway .
cd ../..

# Build Worker Service
cd apps/worker-service
DOCKER_BUILDKIT=0 docker build -t weather-platform-end-to-end-worker-service .
cd ../..

# Start all services
docker-compose --env-file .env.production up -d
```

---

### Containers Not Starting

```bash
# View detailed logs
docker-compose logs

# Check specific service
docker-compose logs api-gateway

# Restart services
docker-compose --env-file .env.production down
docker-compose --env-file .env.production up -d
```

---

### SSH Connection Issues

**Problem:** `ssh -i key.pem user@IP` hangs or times out

**Diagnostics:**
```powershell
# Windows - Verbose mode
ssh -v -i weather-platform-key.pem ec2-user@13.239.169.17
```

**Common Causes:**

1. **EC2 instance stopped**
   - Check AWS Console → EC2 → Instances
   - Start instance if stopped

2. **Security group blocks port 22**
   - Add SSH rule (see Security Group Issues above)

3. **Wrong IP address**
   - Public IP changes when you stop/start EC2
   - Get new IP from AWS Console

4. **Wrong username**
   - Amazon Linux: `ec2-user`
   - Ubuntu: `ubuntu`

5. **Key file permissions (Windows)**
   - Right-click .pem → Properties → Security
   - Remove all inherited permissions
   - Add only your user with Full control

**Alternative - Browser SSH:**
1. AWS Console → EC2 → Instances
2. Select instance → **"Connect"**
3. Choose **"EC2 Instance Connect"**

---

### Out of Memory (t2.micro)

**Symptoms:** Services crashing, slow performance

**Solution:** Add swap space

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

---

### Disk Space Full

**Solution:** Clean up Docker

```bash
# Remove unused images
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
df -h
```

---

### Environment Variables Not Loading

**Problem:** Services can't connect to Redis, Postgres, etc.

**Check:**
```bash
# Verify .env.production exists in correct directory
pwd  # Should be in weather-platform-end-to-end
ls -la .env.production

# Check contents
cat .env.production

# Restart with explicit env file
docker-compose --env-file .env.production down
docker-compose --env-file .env.production up -d
```

---

### Port Already in Use

**Error:** `port is already allocated`

**Solution:**
```bash
# Find what's using the port
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or stop conflicting Docker containers
docker ps
docker stop <container-id>
```

---

### Nginx Configuration Errors

```bash
# Test Nginx config
sudo nginx -t

# If error, check config file
# Amazon Linux:
sudo cat /etc/nginx/conf.d/weather-platform.conf

# Ubuntu:
sudo cat /etc/nginx/sites-available/weather-platform

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

### Check Logs

```bash
# Docker logs
docker-compose logs -f
docker-compose logs api-gateway --tail=100

# Nginx logs (Amazon Linux)
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u docker -f
```

---

### Complete Reset

If nothing works, start fresh:

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker system prune -a

# Rebuild from scratch
DOCKER_BUILDKIT=0 docker-compose --env-file .env.production build
docker-compose --env-file .env.production up -d

# Check status
docker-compose ps
docker-compose logs -f
```

---

## Useful Commands

### Docker Management

```bash
# View all containers
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs api-gateway --tail=50

# Restart services
docker-compose restart
docker-compose restart api-gateway

# Stop services
docker-compose down

# Start services
docker-compose --env-file .env.production up -d

# Rebuild and restart
docker-compose --env-file .env.production up -d --build

# Clean up
docker system prune -a
docker volume prune
```

### Nginx Management

```bash
# Test config
sudo nginx -t

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring

```bash
# Memory usage
free -h

# Disk usage
df -h

# Docker stats
docker stats

# Top processes
htop  # or top
```

---

## Cost Optimization

### Stop EC2 When Not Using

```bash
# From AWS Console
# Select instance → Instance State → Stop instance

# From AWS CLI
aws ec2 stop-instances --instance-ids i-xxxxxxxxx

# Start again
aws ec2 start-instances --instance-ids i-xxxxxxxxx
```

**Note:** Public IP changes when you stop/start!

### Monitor Free Tier Usage

- Check [AWS Free Tier Dashboard](https://console.aws.amazon.com/billing/home#/freetier)
- Set up billing alerts
- Watch EC2 hours (750/month limit)

---

## Summary

**What We Deployed:**
- ✅ EC2 instance (t2.micro/t3.micro)
- ✅ Docker + Docker Compose
- ✅ API Gateway (Node.js + Express)
- ✅ Worker Service (BullMQ, RabbitMQ, Kafka consumers)
- ✅ Redis, PostgreSQL, RabbitMQ, Kafka (all in Docker)
- ✅ Nginx reverse proxy
- ✅ S3 integration for cloud storage

**Estimated Cost:** $0 (within free tier limits)

**Access URLs:**
- API: `http://YOUR-EC2-IP:3000`
- Nginx: `http://YOUR-EC2-IP`
- Health: `http://YOUR-EC2-IP:3000/health`
- Weather: `http://YOUR-EC2-IP:3000/api/weather/London`

---

## Next Steps

1. **Setup Domain** (optional)
   - Buy domain from Route 53
   - Point A record to EC2 IP
   - Update Nginx config with domain name

2. **Setup SSL/HTTPS** (optional)
   - Use Let's Encrypt (free)
   - Install certbot
   - Configure Nginx for HTTPS

3. **Setup Monitoring**
   - CloudWatch for EC2 metrics
   - Application logs to CloudWatch Logs
   - Set up alarms

4. **Backup Strategy**
   - Regular snapshots of EBS volume
   - Database backups to S3
   - Code in Git

5. **CI/CD Pipeline**
   - GitHub Actions for auto-deployment
   - Automated testing
   - Blue-green deployment

---

**🎉 Deployment Complete!**

Your weather platform is now running on AWS EC2!












Short answer: **❌ No. A terminated EC2 instance cannot be revived.**

Now the **full, interview-ready explanation**, plus what *can* be recovered 👇

---

## 🔴 What “Terminate” Means in AWS

When you **terminate** an EC2 instance:

* The **virtual machine is destroyed**
* The **instance ID is gone forever**
* You **cannot start it again**
* AWS **does not keep a backup**

> Terminate ≠ Stop
> Terminate = **delete**

---

## 🟢 What You *Can* Still Recover (Sometimes)

### 1️⃣ **EBS Volume (IF protected)**

If the root EBS volume had:

* ❌ *Delete on termination* = **false**

Then:

* Volume still exists
* You can attach it to a new EC2
* Recover data manually

📌 Default: **Delete on termination = true** (so usually data is gone)

---

### 2️⃣ **AMI (If you created one earlier)**

If you created an AMI before terminating:

* You can launch a **new EC2 from that AMI**
* Everything will be restored

---

### 3️⃣ **Snapshots**

If you had:

* Manual EBS snapshots
* Automated backups

You can:

* Restore snapshot
* Create volume
* Attach to new EC2

---

## 🔴 What Is GONE FOREVER

| Item                | Recoverable |
| ------------------- | ----------- |
| EC2 instance        | ❌           |
| Instance ID         | ❌           |
| Public IP           | ❌           |
| RAM data            | ❌           |
| Root disk (default) | ❌           |

---

## 🟡 Stop vs Terminate (MEMORIZE THIS)

| Action          | Stop            | Terminate      |
| --------------- | --------------- | -------------- |
| Can start again | ✅               | ❌              |
| Data kept       | ✅               | ❌ (by default) |
| Billing stops   | ❌ (EBS charged) | ✅              |
| Instance exists | ✅               | ❌              |

---

## 🧠 INTERVIEW-READY ANSWER

**Q:** Can a terminated EC2 instance be revived?

**A:**

> “No. Terminated EC2 instances are permanently deleted. Only associated resources like EBS volumes or AMIs can be reused if they were preserved before termination.”

---

## ✅ WHAT TO DO IF YOU TERMINATED BY MISTAKE

### Fastest recovery path:

1. Launch **new EC2**
2. Use same AMI
3. Use same security group
4. Use same setup script
5. Redeploy app

That’s why:

* Infrastructure should be **scripted**
* Data should be **external (S3 / RDS)**

---

## 🔐 BEST PRACTICES (VERY IMPORTANT)

1. Always keep data in:

   * RDS
   * S3
   * External volumes
2. Use:

   * AMIs
   * Snapshots
3. Use:

   * Terraform / CloudFormation
4. Enable:

   * Termination protection

---

## 🧪 BONUS: Termination Protection

AWS Console → EC2 → Instance → Actions →
**Change termination protection → Enable**

Prevents accidental deletion.

---

## 🎯 FINAL TAKEAWAY

> EC2 instances are **disposable**.
> Data and infra must be **reproducible**.

This mindset is **exactly what interviewers want to hear**.

If you want, I can next explain:

* How to **recover EBS manually**
* How to **design infra assuming EC2 will die**
* How Terraform helps prevent this

Just tell me 👍
