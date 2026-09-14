# 🚗 Repo Ride

> A campus-only ride-sharing platform designed to make student transportation around university campuses easier, safer, and more affordable.

## 📌 Overview

**Repo Ride** is a web application built for the hackathon to solve everyday campus transportation problems. It connects students who need a ride with available drivers, allowing them to find, create, join, and track campus rides from one place.

The platform is designed around a simple idea:

**Share rides → split costs → reduce waiting → improve campus mobility.**

## ✨ Key Features

### 🧑‍🎓 Student / Passenger
- Student registration and login
- Search for available campus rides
- Choose pickup and destination locations
- Select the number of seats
- Join available rides
- View and manage booked rides
- Generate and use a boarding OTP
- Track active rides
- View driver and vehicle information
- Find students/rides based on campus travel needs
- Personal profile and ride history

### 🚕 Driver
- Driver registration/login flow
- Driver dashboard
- Create and publish a ride
- Set vehicle type, vehicle number, seats, route and fare
- Receive and manage ride requests
- View passengers
- Verify passenger boarding using OTP
- Track ride activity
- Withdraw ride earnings

### 💳 VertoPay Wallet
- Passenger wallet balance
- Wallet top-up flow
- Automatic fare deduction
- Transaction history
- Driver earnings
- Driver withdrawal flow
- Payment status and transaction references

### 🗺️ Campus Mobility
- LPU campus locations
- Pickup and destination selection
- Available rides
- Live ride view
- Route stops
- Ride progress visualization
- Hostel and campus-location support

### 🔄 Real-Time Data
- Firebase Firestore integration
- Real-time rides and bookings
- Ride requests
- Wallet transactions
- Local-storage fallback for supported flows

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| TypeScript | Type-safe application development |
| Vite | Development server and build tool |
| Tailwind CSS | Styling and responsive UI |
| Firebase | Authentication/data infrastructure |
| Cloud Firestore | Real-time application data |
| Lucide React | Icons |
| Motion | UI animations |
| Google GenAI | AI integration support |

## 📁 Project Structure

```text
Repo-Ride/
├── src/
│   ├── components/       # UI components and modals
│   ├── context/           # Authentication and wallet state
│   ├── data/              # Campus and initial application data
│   ├── lib/               # Firebase configuration
│   ├── services/          # Authentication and ride services
│   ├── App.tsx            # Main application
│   ├── index.css          # Global styles
│   ├── main.tsx           # Application entry point
│   └── types.ts           # TypeScript interfaces/types
├── index.html
├── package.json
├── firebase-applet-config.json
├── firestore.rules
├── .env.example
└── metadata.json
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/repo-ride.git
cd repo-ride
```

### 2. Install dependencies

```bash
npm install
```

If you use Bun:

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Add the required values for your environment.

**Never commit real API keys, passwords, private credentials, or other secrets to GitHub.**

### 4. Start the development server

```bash
npm run dev
```

Then open the local URL shown by Vite in your browser.

## 🏗️ Build for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 🔍 Type Checking

```bash
npm run lint
```

## 🔐 Security Notes

This project uses Firebase and client-side configuration.

Before deploying this project publicly:

- Keep API keys/secrets out of source code where applicable.
- Review and configure Firebase Authentication and Firestore security rules.
- Do not use real student personal information in demo data.
- Replace demo/test payment and OTP flows with production-grade services before real-world deployment.
- Review all Firebase permissions before connecting the application to a production database.

## 🎯 Problem Statement

Large university campuses can involve long walking distances, limited transportation availability, waiting time, and inefficient use of available rides.

Students may be travelling along similar routes at the same time, while drivers may have empty seats.

**Repo Ride** aims to turn that unused capacity into a simple campus ride-sharing network.

## 💡 Proposed Solution

Repo Ride provides a single platform where students can:

1. Select where they are going.
2. Find suitable rides.
3. Join a ride and reserve seats.
4. Use an OTP-based boarding flow.
5. Track their ride.
6. Manage payments through an in-app wallet.

Drivers can publish rides, manage requests, verify passengers, and receive their ride earnings.

## 🌱 Future Improvements

- Real GPS location tracking
- Push notifications
- Production-grade phone OTP authentication
- Secure online payments
- Advanced ride matching
- Route optimization
- Driver/passenger ratings and reviews
- SOS and emergency assistance
- Admin dashboard
- Analytics for campus transportation
- Multi-campus support

## 🏆 Hackathon Project

**Project:** Repo Ride  
**Category:** Campus Life / Student Experience / Mobility  
**Built for:** Hackathon

## 👥 Team

Add your team members here:

- **Your Name** — Developer / Role
- **Team Member 2** — Role
- **Team Member 3** — Role
- **Team Member 4** — Role

## 📸 Screenshots

Add screenshots of the main application here:

```text
docs/
├── home.png
├── available-rides.png
├── driver-dashboard.png
├── live-rides.png
└── wallet.png
```

Example:

```markdown
![Repo Ride Home](docs/home.png)
```

## 📄 License

This project was created as a hackathon project. Add a specific open-source license here if you decide to distribute the code under one.

---

⭐ If you find this project interesting, consider giving the repository a star!
