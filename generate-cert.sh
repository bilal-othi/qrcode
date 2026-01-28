#!/bin/bash

# Script to generate self-signed SSL certificate for local HTTPS testing

echo "Generating self-signed SSL certificate for local testing..."
echo ""

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate private key
openssl genrsa -out certs/server.key 2048

# Generate certificate signing request
openssl req -new -key certs/server.key -out certs/server.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in certs/server.csr -signkey certs/server.key -out certs/server.crt

# Clean up CSR file
rm certs/server.csr

echo ""
echo "✅ Certificate generated successfully!"
echo ""
echo "Files created:"
echo "  - certs/server.key (private key)"
echo "  - certs/server.crt (certificate)"
echo ""
echo "You can now run: npm run start:https"
echo ""
echo "⚠️  Note: This is a self-signed certificate for testing only."
echo "   Your browser will show a security warning - this is normal for local testing."
