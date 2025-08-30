# 🏥 Secure Health Blockchain

> **Revolutionizing Healthcare Data Management with Blockchain Technology**

A secure, decentralized platform that empowers patients to own, control, and securely share their health records using blockchain technology. Built with Next.js, Supabase, and Ethereum smart contracts, this project ensures HIPAA/GDPR compliance while providing seamless interoperability with existing healthcare systems.

## 🌟 Project Overview

Secure Health Blockchain addresses the critical challenges in healthcare data management by creating a **patient-centric, permissioned access system** that puts individuals in control of their medical information. Our platform combines the immutability of blockchain with advanced encryption to create a secure, scalable solution for health record management.

### 🎯 **Core Mission**
Design and implement a secure blockchain architecture that stores encrypted patient health records, allowing patients to grant permissioned access to hospitals, doctors, or insurers via private keys or smart contracts, while maintaining full control over their data.

## 🚀 Key Features

### 🔐 **Security & Privacy**
- **End-to-end encryption** of all health records
- **Zero-knowledge proofs** for data verification
- **HIPAA/GDPR compliance** built-in
- **Private key management** for patient control
- **Audit trails** for all data access

### 📱 **User Experience**
- **Responsive web application** with modern UI/UX
- **Mobile-first design** for patient convenience
- **Dynamic interface** with real-time updates
- **Intuitive permission management**
- **Seamless data upload and sharing**

### ⛓️ **Blockchain Integration**
- **Smart contracts** for automated access control
- **Ethereum-based** architecture with Sepolia testnet
- **On-chain audit trails** for transparency
- **Off-chain storage** for large medical files
- **Hash verification** for data integrity

### 🏥 **Healthcare Interoperability**
- **EHR system integration** capabilities
- **FHIR standard** compliance
- **Hospital database** connectivity
- **Insurance claim** automation
- **Research data** sharing protocols

## 🏗️ Architecture

### **Frontend Layer**
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **Shadcn/ui** components for modern UI
- **PWA support** for mobile experience

### **Backend Services**
- **Supabase** for authentication and database
- **Netlify Functions** for serverless APIs
- **Netlify Functions** for file storage
- **Health check** monitoring system

### **Blockchain Layer**
- **Hardhat** development environment
- **Solidity smart contracts** for access control
- **Ethereum Sepolia** testnet deployment
- **Web3 integration** with viem library

### **Data Security**
- **AES-256 encryption** for file storage
- **Public-key cryptography** for access control
- **Hash verification** for data integrity
- **Audit logging** for compliance

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS | Modern, responsive web application |
| **Backend** | Supabase, Netlify Functions | Authentication, database, serverless APIs |
| **Blockchain** | Ethereum, Solidity, Hardhat | Smart contracts, access control |
| **Storage** | Netlify Functions, IPFS-ready | Secure file storage |
| **Database** | PostgreSQL (Supabase) | Patient records, permissions, audit trails |
| **Deployment** | Netlify | Global CDN, serverless functions |

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- MetaMask wallet
- Supabase account
- Sepolia testnet ETH

### **Installation**
```bash
# Clone the repository
git clone https://github.com/CrimsonArrow26/SecureHealth.git
cd SecureHealth

# Install dependencies
npm install

# Set up environment variables
cp env.production.template .env.production
# Edit .env.production with your values

# Run development server
npm run dev
```

### **Environment Setup**
```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
# File storage handled by Netlify Functions
NEXT_PUBLIC_RPC_URL=your-sepolia-rpc-url
```

## 🏥 Use Cases

### **Patient Management**
- **Upload health records** securely
- **Control access permissions** granularly
- **View complete medical history** in one place
- **Share data** with healthcare providers
- **Monitor access** to personal information

### **Healthcare Provider Integration**
- **Request patient data** through secure channels
- **Verify data authenticity** via blockchain
- **Access patient records** with permission
- **Submit insurance claims** automatically
- **Participate in research** with patient consent

### **Insurance & Research**
- **Automated claim processing** via smart contracts
- **Research data sharing** with patient consent
- **Audit trails** for compliance
- **Data integrity verification** through hashing

## 🔒 Security Features

### **Data Protection**
- **End-to-end encryption** of all health records
- **Private key management** for patient control
- **Zero-knowledge proofs** for verification
- **Audit logging** for compliance tracking

### **Access Control**
- **Smart contract-based** permission system
- **Time-limited access** tokens
- **Granular permission** levels
- **Revocable access** rights

### **Compliance**
- **HIPAA compliance** for US healthcare
- **GDPR compliance** for EU data protection
- **Audit trails** for regulatory requirements
- **Data retention** policies

## 🚀 Deployment

### **Netlify Deployment (Recommended)**
```bash
# Build for production
npm run build:netlify

# Deploy to Netlify
npm run deploy:netlify
```

### **Environment Variables in Netlify**
1. Go to your site in Netlify dashboard
2. Site settings → Environment variables
3. Add all variables from `.env.production`

### **Health Check**
- Visit `/health` endpoint to verify deployment
- Monitor system status and performance

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run build:netlify # Netlify-optimized build
npm run deploy:netlify # Deploy to Netlify
npm run test         # Run tests
npm run lint         # Lint code
```

### **Smart Contract Development**
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat ignition deploy --network sepolia
```

## 🌐 Live Demo

- **Production URL**: [Your Netlify Domain]
- **Health Check**: `/health` endpoint
- **Documentation**: `NETLIFY-DEPLOYMENT.md`

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and ensure all code follows our security standards.

### **Security Considerations**
- Never commit environment files
- Follow encryption best practices
- Maintain audit trail integrity
- Test all security features thoroughly

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check `NETLIFY-DEPLOYMENT.md`
- **Issues**: Report bugs via GitHub Issues
- **Security**: Report security issues privately

## 🎯 Roadmap

- [ ] **Phase 1**: Core blockchain infrastructure ✅
- [ ] **Phase 2**: EHR system integration
- [ ] **Phase 3**: Insurance claim automation
- [ ] **Phase 4**: Research data marketplace
- [ ] **Phase 5**: Multi-chain support

---

**Built with ❤️ for a more secure and patient-centric healthcare future**

> *"Your health data, your control, our blockchain security"*
