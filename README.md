🔍 Findora – Lost and Found Platform

Findora is a peer-to-peer lost-and-found platform built on a centralized server that leverages computer vision to convert images of found items into structured text transcripts, which are securely stored in a database. Individuals who have lost an item describe it in textual form, and humanized matching filters intelligently compare lost and found records to identify potential matches. To ensure security and reliability during item recovery, OTP-based authorization is implemented for user verification.

🌟 Features
📌 Report lost items with detailed information
📦 Register found items easily
🔄 Smart matching between lost and found reports
🤖 AI-assisted analysis using Google Gemini
🔐 Secure authentication and data handling
🧾 QR code integration for fast item identification
🌐 Clean and responsive user interface
🎨 User Interface Preview
Findora UI Preview

🧠 How It Works
Users sign up or log in securely using Firebase Authentication.
A user reports a lost or found item with details like category, location, and description.
Item data is stored securely in Firestore, with images saved in Firebase Storage.
Google Gemini AI assists in intelligently matching lost and found items.
QR codes can be used to quickly identify and verify items.
Once a match is confirmed, the item is safely returned to its owner.

🛠 Tech Stack
Frontend: React + Vite, Tailwind CSS
Backend: Express.js
Authentication: Firebase Authentication
Database: Firebase Firestore
Storage: Firebase Storage
AI Integration: Google Gemini AI
Utilities: QR Code generation and scanning

🚀 Getting Started
Prerequisites
Node.js
Git
Firebase project setup
