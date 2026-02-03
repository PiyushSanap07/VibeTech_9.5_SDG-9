import { db } from '../firebase/config';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

export const seedDemoData = async () => {
  try {
    // 1. Proposals
    const proposals = [
      {
        title: "Quantum Secure Communications Layer",
        description: "A next-gen encryption framework using quantum key distribution for terrestrial fiber networks. Solves the post-quantum cryptography threat for financial institutions.",
        domain: "CyberSecurity",
        budget: 750000,
        timeline: "18 months",
        innovator: "Dr. Elena Vance"
      },
      {
        title: "Algae-Based Carbon Sequestration Bioreactors",
        description: "Modular bioreactors that utilize genetically optimized algae strains to capture CO2 from industrial exhaust 4x faster than natural systems.",
        domain: "CleanTech",
        budget: 450000,
        timeline: "12 months",
        innovator: "GreenEarth Labs"
      },
      {
        title: "Neuro-Adaptive Prosthetic Control",
        description: "An AI-driven neural interface that allows for high-fidelity control of prosthetic limbs with real-time sensory feedback to the user.",
        domain: "BioTech",
        budget: 1200000,
        timeline: "24 months",
        innovator: "Synapse Systems"
      }
    ];

    for (const p of proposals) {
      await addDoc(collection(db, 'proposals'), p);
    }

    // 2. Demo Funder (Will be created on first login/signup usually, but we can pre-seed if we have a UID)
    // For this demo, we assume the user will sign up and we'll use the profile page.

    console.log("Seed data created successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};
