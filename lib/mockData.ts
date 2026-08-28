import { Droplet, Wind, Activity, Flame } from "lucide-react";

export type Lesson = {
  id: string;
  title: string;
  status: "locked" | "in-progress" | "completed";
  content: string; // The HTML/Markdown text body of the lesson
  type: "video" | "document" | "image";
};

export type Course = {
  slug: string;
  title: string;
  description: string;
  category: "Flood" | "Cyclone" | "Earthquake" | "Fire";
  iconName: string; // "Droplet", "Wind", "Activity", "Flame"
  duration: string;
  progress: number;
  lessons: Lesson[];
};

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export type Quiz = {
  slug: string;
  title: string;
  category: string;
  questions: Question[];
  difficulty: "Easy" | "Medium" | "Hard";
};

export type QuizAttempt = {
  id: string;
  quizSlug: string;
  quizTitle: string;
  score: number;
  total: number;
  date: string;
};

export type Alert = {
  id: string;
  title: string;
  message: string;
  severity: "High" | "Medium" | "Low";
  date: string;
  read: boolean;
};

export type StudentProfile = {
  name: string;
  email: string;
  avatar?: string;
  preparednessScore: number;
  certificates: number;
};

// Initial Mock Data

export const mockStudent: StudentProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  preparednessScore: 45,
  certificates: 0,
};

export const mockCourses: Course[] = [
  {
    slug: "flood-preparedness",
    title: "Flood Preparedness",
    description: "Learn how to secure your property and evacuate safely during rising waters.",
    category: "Flood",
    iconName: "Droplet",
    duration: "25 min",
    progress: 72,
    lessons: [
      {
        id: "intro-to-floods",
        title: "Introduction to Floods",
        status: "completed",
        type: "video",
        content: "Floods are the most common natural disaster in the United States. Learn about the different types of floods and how they occur.",
      },
      {
        id: "causes-warning-signs",
        title: "Causes & Warning Signs",
        status: "completed",
        type: "document",
        content: "Heavy rainfall, storm surges, and rapid snowmelt can cause floods. Look out for continuous heavy rain and flash flood warnings.",
      },
      {
        id: "preparing-your-home",
        title: "Preparing Your Home",
        status: "completed",
        type: "document",
        content: "Elevate your furnace, water heater, and electric panel. Waterproof your basement and clean out gutters.",
      },
      {
        id: "emergency-kit-checklist",
        title: "Emergency Kit Checklist",
        status: "completed",
        type: "document",
        content: "Pack 3 days of water, non-perishable food, flashlights, batteries, a first aid kit, and copies of important documents.",
      },
      {
        id: "during-a-flood",
        title: "What To Do During a Flood",
        status: "in-progress",
        type: "video",
        content: "Move to higher ground immediately. Do not walk, swim, or drive through flood waters. 'Turn Around, Don't Drown'.",
      },
      {
        id: "evacuation-safety",
        title: "Evacuation & Safety",
        status: "locked",
        type: "document",
        content: "Follow designated evacuation routes. Do not drive around barricades as they are put up for your protection.",
      },
      {
        id: "recovery-aftermath",
        title: "Recovery & Aftermath",
        status: "locked",
        type: "document",
        content: "Wait for the all-clear before returning home. Take photos of damage for insurance. Avoid wading in floodwater which may be contaminated or electrically charged.",
      },
    ],
  },
  {
    slug: "earthquake-safety",
    title: "Earthquake Safety",
    description: "Essential protocols for drop, cover, and hold on, plus structural assessment basics.",
    category: "Earthquake",
    iconName: "Activity",
    duration: "40 min",
    progress: 0,
    lessons: [
      {
        id: "drop-cover-hold",
        title: "Drop, Cover, and Hold On",
        status: "in-progress",
        type: "video",
        content: "The moment you feel shaking, drop to your hands and knees, cover your head and neck under a sturdy table, and hold on to your shelter.",
      },
      {
        id: "structural-safety",
        title: "Structural Safety Basics",
        status: "locked",
        type: "document",
        content: "Identify load-bearing walls and safe spots away from windows and heavy furniture that could tip over.",
      },
    ],
  },
  {
    slug: "fire-prevention",
    title: "Fire Prevention",
    description: "Understand fire behavior, prevention strategies, and safe evacuation routes.",
    category: "Fire",
    iconName: "Flame",
    duration: "15 min",
    progress: 0,
    lessons: [
      {
        id: "fire-behavior",
        title: "Fire Behavior",
        status: "in-progress",
        type: "document",
        content: "Fire needs heat, fuel, and oxygen. Removing any of these can stop a fire.",
      },
      {
        id: "evacuation-routes",
        title: "Safe Evacuation Routes",
        status: "locked",
        type: "document",
        content: "Always have two ways out of every room. Practice your escape plan twice a year.",
      },
    ],
  },
];

export const mockQuizzes: Quiz[] = [
  {
    slug: "earthquake-basics",
    title: "Earthquake Basics Quiz",
    category: "Earthquake",
    difficulty: "Medium",
    questions: [
      {
        id: "q1",
        text: "What is the recommended action when you feel an earthquake starting?",
        options: [
          "Run outside immediately",
          "Drop, Cover, and Hold On",
          "Stand under a doorway",
          "Call emergency services immediately"
        ],
        correctAnswerIndex: 1,
        explanation: "Running outside or standing under doorways is dangerous. You should Drop, Cover, and Hold On."
      },
      {
        id: "q2",
        text: "Which item is MOST essential in an earthquake survival kit?",
        options: [
          "A laptop computer",
          "Bottled water",
          "A deck of cards",
          "Gourmet snacks"
        ],
        correctAnswerIndex: 1,
        explanation: "Water is the most critical survival item following a major earthquake where infrastructure may be destroyed."
      }
    ]
  },
  {
    slug: "flood-survival",
    title: "Flood Survival Test",
    category: "Flood",
    difficulty: "Hard",
    questions: [
      {
        id: "q3",
        text: "How much fast-moving water is required to carry away most passenger vehicles?",
        options: ["6 inches", "1 foot", "2 feet", "4 feet"],
        correctAnswerIndex: 2,
        explanation: "Just 2 feet of rushing water can carry away most vehicles, including SUVs and pickups."
      },
      {
        id: "q4",
        text: "If you are trapped in a building and water is rising, what should you do?",
        options: [
          "Climb to the roof immediately",
          "Go to the highest floor and wait",
          "Try to swim out the window",
          "Hide in a closet"
        ],
        correctAnswerIndex: 1,
        explanation: "Go to the highest level, but avoid closed attics where you may become trapped. Only go to the roof if necessary."
      }
    ]
  }
];

export const mockAlerts: Alert[] = [
  {
    id: "a1",
    title: "Heavy Rain Alert",
    message: "Expect heavy rainfall measuring 3-5 inches over the next 24 hours. Localized street flooding is possible in low-lying areas. Avoid driving through water.",
    severity: "Medium",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: "a2",
    title: "Emergency Preparedness Reminder",
    message: "It's time to check the batteries in your smoke detectors and update your emergency supply kits. Ensure you have 3 days of non-perishable food.",
    severity: "Low",
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: "a3",
    title: "Severe Thunderstorm Warning",
    message: "A severe thunderstorm capable of producing quarter-size hail and 60 mph wind gusts is moving through the area. Seek shelter indoors immediately.",
    severity: "High",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    read: true,
  }
];
