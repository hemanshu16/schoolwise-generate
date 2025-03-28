
export interface District {
  id: string;
  name: string;
  password: string;
}

export interface Taluk {
  id: string;
  name: string;
  districtId: string;
  pin: string;
}

export interface School {
  id: string;
  name: string;
  talukId: string;
  pin: string;
}

export interface ReportData {
  title: string;
  description: string;
  stats: {
    totalStudents: number;
    passPercentage: number;
    averageMarks: number;
    topScorer: string;
  };
  subjects: {
    name: string;
    averageMarks: number;
    passPercentage: number;
  }[];
}

// Sample mock data
export const districts: District[] = [
  { id: "d1", name: "North District", password: "1234" },
  { id: "d2", name: "South District", password: "5678" },
  { id: "d3", name: "East District", password: "9012" },
  { id: "d4", name: "West District", password: "3456" },
];

export const taluks: Taluk[] = [
  { id: "t1", name: "Riverside", districtId: "d1", pin: "1111" },
  { id: "t2", name: "Hilltop", districtId: "d1", pin: "2222" },
  { id: "t3", name: "Meadowvale", districtId: "d2", pin: "3333" },
  { id: "t4", name: "Brookside", districtId: "d2", pin: "4444" },
  { id: "t5", name: "Lakewood", districtId: "d3", pin: "5555" },
  { id: "t6", name: "Pineville", districtId: "d3", pin: "6666" },
  { id: "t7", name: "Oakridge", districtId: "d4", pin: "7777" },
  { id: "t8", name: "Cedar Heights", districtId: "d4", pin: "8888" },
];

export const schools: School[] = [
  { id: "s1", name: "Riverside Elementary", talukId: "t1", pin: "1234" },
  { id: "s2", name: "Riverside High", talukId: "t1", pin: "2345" },
  { id: "s3", name: "Hilltop Academy", talukId: "t2", pin: "3456" },
  { id: "s4", name: "Hilltop Primary", talukId: "t2", pin: "4567" },
  { id: "s5", name: "Meadowvale School", talukId: "t3", pin: "5678" },
  { id: "s6", name: "Brookside Institute", talukId: "t4", pin: "6789" },
  { id: "s7", name: "Lakewood Primary", talukId: "t5", pin: "7890" },
  { id: "s8", name: "Pineville Academy", talukId: "t6", pin: "8901" },
  { id: "s9", name: "Oakridge School", talukId: "t7", pin: "9012" },
  { id: "s10", name: "Cedar Heights High", talukId: "t8", pin: "0123" },
];

export const generateReportData = (
  type: "district" | "taluk" | "school",
  name: string
): ReportData => {
  // Add safeguard against null/undefined values
  if (!type || !name) {
    console.warn(`Invalid parameters passed to generateReportData: type=${type}, name=${name}`);
    // Provide default values
    type = type || "school";
    name = name || "Unknown";
  }

  // Now safely use type and name since they have fallback values
  const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
  
  return {
    title: `${name} ${typeCapitalized} Report`,
    description: `Performance overview for ${name} ${type}`,
    stats: {
      totalStudents: Math.floor(Math.random() * 1000) + 500,
      passPercentage: Math.floor(Math.random() * 30) + 70,
      averageMarks: Math.floor(Math.random() * 20) + 70,
      topScorer: ["Aiden Smith", "Emma Johnson", "Noah Williams", "Olivia Brown", "Liam Davis"][
        Math.floor(Math.random() * 5)
      ],
    },
    subjects: [
      {
        name: "Mathematics",
        averageMarks: Math.floor(Math.random() * 20) + 70,
        passPercentage: Math.floor(Math.random() * 30) + 70,
      },
      {
        name: "Science",
        averageMarks: Math.floor(Math.random() * 20) + 70,
        passPercentage: Math.floor(Math.random() * 30) + 70,
      },
      {
        name: "English",
        averageMarks: Math.floor(Math.random() * 20) + 70,
        passPercentage: Math.floor(Math.random() * 30) + 70,
      },
      {
        name: "Social Studies",
        averageMarks: Math.floor(Math.random() * 20) + 70,
        passPercentage: Math.floor(Math.random() * 30) + 70,
      },
    ],
  };
};
