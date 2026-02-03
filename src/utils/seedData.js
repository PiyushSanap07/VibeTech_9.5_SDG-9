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

    // 2. Funders - Real World Giants
    // Clear existing funders to avoid duplicates/confusion if possible, 
    // but for simple seed we'll just add these distinct profiles.
    const funders = [
      {
        name: "Tata Sons",
        type: "Corporate Venture",
        focus: ["CleanTech", "Automotive", "DeepTech", "Steel"],
        minBudget: 10000000, // 1 Cr +
        riskAppetite: "Balanced",
        details: "The principal investment holding company. actively scouting for sustainable energy, EV infrastructure, and advanced material innovations."
      },
      {
        name: "Reliance Industries",
        type: "Conglomerate",
        focus: ["Green Energy", "Digital Services", "Retail", "BioTech"],
        minBudget: 25000000,
        riskAppetite: "High",
        details: "Leading India's digital and green revolution. Seeking breakthrough technologies in hydrogen fuel, battery storage, and 5G/6G applications."
      },
      {
        name: "Adani Group",
        type: "Infrastructure",
        focus: ["Renewable Energy", "Defense", "Logistics", "Aerospace"],
        minBudget: 15000000,
        riskAppetite: "Aggressive",
        details: "Investing heavily in green hydrogen ecosystem, autonomous drones, and smart city infrastructure."
      },
      {
        name: "Infosys Innovation Fund",
        type: "CVC",
        focus: ["AI/ML", "Cloud Computing", "SaaS", "IoT"],
        minBudget: 5000000,
        riskAppetite: "High",
        details: "Backing startups that help enterprises accelerate their digital transformation journey through AI and automation."
      },
      {
        name: "Mahindra Partners",
        type: "Private Equity",
        focus: ["AgriTech", "Electric Mobility", "Sustainability"],
        minBudget: 8000000,
        riskAppetite: "Balanced",
        details: "Focused on future of mobility and agricultural efficiency. Looking for scalable solutions in rural technology."
      },
      {
        name: "Wipro Ventures",
        type: "CVC",
        focus: ["CyberSecurity", "Enterprise Tech", "Big Data"],
        minBudget: 3000000,
        riskAppetite: "Moderate",
        details: "Strategic investment arm of Wipro, focused on enterprise software and security solutions."
      }
    ];

    const fundersRef = collection(db, 'funders');
    for (const f of funders) {
      // Use setDoc with a custom ID based on name to prevent duplicates on multiple seeds
      const id = f.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'funders', id), f);
    }

    // 2. Demo Funder (Will be created on first login/signup usually, but we can pre-seed if we have a UID)
    // For this demo, we assume the user will sign up and we'll use the profile page.

    console.log("Seed data created successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};
