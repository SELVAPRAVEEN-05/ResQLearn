export type DisasterType =
  | "general"
  | "fire"
  | "flood"
  | "heatwave"
  | "cyclone"
  | "earthquake";

export interface DisasterTypeOption {
  id: DisasterType;
  label: string;
  description: string;
  iconName: string;
}

export const DISASTER_OPTIONS: DisasterTypeOption[] = [
  {
    id: "general",
    label: "General Emergency",
    description: "Facilities ordered primarily by proximity",
    iconName: "ShieldAlert",
  },
  {
    id: "fire",
    label: "Fire",
    description: "Fire stations and medical response facilities prioritized",
    iconName: "Flame",
  },
  {
    id: "flood",
    label: "Flood",
    description: "Emergency shelters and medical facilities prioritized",
    iconName: "Waves",
  },
  {
    id: "heatwave",
    label: "Heatwave",
    description: "Hospitals and cooling shelter facilities prioritized",
    iconName: "Sun",
  },
  {
    id: "cyclone",
    label: "Cyclone",
    description: "Evacuation shelters and hospital facilities prioritized",
    iconName: "Wind",
  },
  {
    id: "earthquake",
    label: "Earthquake",
    description: "Emergency shelters and medical facilities prioritized",
    iconName: "Activity",
  },
];

// Priority weights per disaster type (1 = Highest Priority)
const DISASTER_FACILITY_PRIORITIES: Record<
  DisasterType,
  Record<string, number>
> = {
  general: {
    hospital: 1,
    fire_station: 1,
    police_station: 1,
    shelter: 1,
    other: 1,
  },
  fire: {
    fire_station: 1,
    hospital: 2,
    police_station: 3,
    shelter: 4,
    other: 5,
  },
  flood: {
    shelter: 1,
    hospital: 2,
    police_station: 3,
    fire_station: 4,
    other: 5,
  },
  heatwave: {
    hospital: 1,
    shelter: 2,
    police_station: 3,
    fire_station: 4,
    other: 5,
  },
  cyclone: {
    shelter: 1,
    hospital: 2,
    fire_station: 3,
    police_station: 4,
    other: 5,
  },
  earthquake: {
    shelter: 1,
    hospital: 2,
    fire_station: 3,
    police_station: 4,
    other: 5,
  },
};

// Explanatory factual reason for priority ranking
export function getDisasterRelevanceReason(
  disasterType: DisasterType,
  facilityType: string,
): string {
  switch (disasterType) {
    case "fire":
      if (facilityType === "fire_station")
        return "Direct fire suppression and emergency response facility";
      if (facilityType === "hospital")
        return "Medical treatment facility for burn and injury response";
      if (facilityType === "police_station")
        return "Perimeter security and evacuation coordination facility";

      return "Emergency support facility";
    case "flood":
      if (facilityType === "shelter")
        return "Evacuation shelter for high-ground displacement support";
      if (facilityType === "hospital")
        return "Emergency medical treatment facility";
      if (facilityType === "police_station")
        return "Evacuation guidance and emergency coordination center";

      return "Emergency response facility";
    case "heatwave":
      if (facilityType === "hospital")
        return "Medical facility with clinical treatment for heat illnesses";
      if (facilityType === "shelter")
        return "Public shelter/cooling facility for heat stress relief";

      return "Emergency support center";
    case "cyclone":
      if (facilityType === "shelter")
        return "Reinforced shelter facility for severe wind/surge protection";
      if (facilityType === "hospital")
        return "Medical trauma treatment facility";
      if (facilityType === "fire_station")
        return "Debris clearance and search-and-rescue facility";

      return "Emergency support facility";
    case "earthquake":
      if (facilityType === "shelter")
        return "Open-area shelter facility for post-seismic displacement";
      if (facilityType === "hospital")
        return "Medical trauma & casualty treatment center";
      if (facilityType === "fire_station")
        return "Structural search-and-rescue facility";

      return "Emergency response facility";
    default:
      return "Nearby emergency response facility";
  }
}

/**
 * Calculates a transparent deterministic relevanceScore for sorting facilities.
 * Higher relevanceScore = More relevant for current disaster + location.
 */
export function calculateRelevanceScore(
  disasterType: DisasterType,
  facilityType: string,
  distanceKm: number,
  isVerified: boolean = false,
  hazardLevel?: string,
): number {
  let score = 0;

  if (disasterType === "general") {
    // For general emergency, distance is primary factor
    score = Math.max(0, 100 - distanceKm * 10);
  } else {
    const priorities =
      DISASTER_FACILITY_PRIORITIES[disasterType] ||
      DISASTER_FACILITY_PRIORITIES.general;
    const priorityRank = priorities[facilityType] || 5;

    // Base score from priority rank: Rank 1 = 100, Rank 2 = 75, Rank 3 = 50, Rank 4 = 25, Rank 5 = 10
    const baseScore = Math.max(10, 125 - priorityRank * 25);

    // Moderate distance penalty (-4 points per km) so distance is respected alongside category relevance
    const distancePenalty = distanceKm * 4;

    score = Math.max(0, baseScore - distancePenalty);
  }

  // Admin Verified priority bonus (+20 points) so verified database facilities receive higher priority
  if (isVerified) {
    score += 20;
  }

  // Hazard exposure score bonus (+15 for Lower exposure, +5 for Moderate exposure)
  if (hazardLevel === "lower") {
    score += 15;
  } else if (hazardLevel === "moderate") {
    score += 5;
  }

  return Math.round(score * 10) / 10;
}
