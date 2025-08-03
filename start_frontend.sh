#!/bin/bash

# Frontend Startup Script for EC2 Deployment
# Save this as start_frontend.sh and make it executable: chmod +x start_frontend.sh

echo "=== Frontend Startup Script ==="

# Update system
echo "Updating system packages..."
sudo yum update -y

# Install nginx
echo "Installing nginx..."
sudo yum install nginx -y

# Start and enable nginx
echo "Starting nginx service..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Backup default nginx config
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Create nginx configuration for frontend
echo "Configuring nginx..."
sudo tee /etc/nginx/conf.d/frontend.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Enable CORS for API calls
    location /api/ {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
EOF

# Copy frontend files to nginx directory
echo "Copying frontend files..."
sudo mkdir -p /var/www/html
sudo cp -r /home/ec2-user/Frontend/* /var/www/html/

# Set proper permissions
sudo chown -R nginx:nginx /var/www/html
sudo chmod -R 755 /var/www/html

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

# Reload nginx
echo "Reloading nginx..."
sudo systemctl reload nginx

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "Frontend deployment completed!"
echo "Frontend is available at: http://$PUBLIC_IP"
echo "Make sure to update script.js with your backend server IP address"
echo "Security Group should allow inbound traffic on port 80 (HTTP)"

# Show nginx status
sudo systemctl status nginx
