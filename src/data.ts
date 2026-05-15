// Data sources are cited in the in-app methodology panel.
// Primary source: Lawyers' Committee for Civil Rights Under Law, Complaint filed Dec 30, 2021
// against Georgia's 2021 enacted redistricting plans (Cong, Senate, House).
// Population baselines: 2020 Decennial Census via Census.gov QuickFacts.
// Atlanta Voice (Feb 2022), NPR (Dec 2023), GALEO Unity Maps (Oct 2021), Atlanta Regional Commission.

export type Group = "latino" | "aapi" | "black" | "white" | "poc";

export interface CountyProfile {
  name: string;
  fips: string;
  pop2020: number;
  shares: { white: number; black: number; latino: number; aapi: number };
  growth_2010_2020?: { latino?: number; aapi?: number };
  note: string;
}

export const COUNTIES: Record<string, CountyProfile> = {
  gwinnett: {
    name: "Gwinnett",
    fips: "13135",
    pop2020: 957062,
    shares: { white: 30.6, black: 27.8, latino: 23.7, aapi: 13.2 },
    note: "Most ethnically diverse county in the Southeastern U.S.",
  },
  hall: {
    name: "Hall",
    fips: "13139",
    pop2020: 203136,
    shares: { white: 58.4, black: 8.7, latino: 29.4, aapi: 2.8 },
    note: "Gainesville is one of the largest Latino population centers in north Georgia.",
  },
  cobb: {
    name: "Cobb",
    fips: "13067",
    pop2020: 766149,
    shares: { white: 47.1, black: 26.4, latino: 15.1, aapi: 5.4 },
    note: "Marietta, Smyrna, Powder Springs, Austell are majority-minority cities.",
  },
  forsyth: {
    name: "Forsyth",
    fips: "13117",
    pop2020: 251283,
    shares: { white: 65.1, black: 4.3, latino: 10.0, aapi: 18.0 },
    growth_2010_2020: { aapi: 692 }, // 6.2% to 17.95% AAPI alone — see Wikipedia + ARC tract data
    note: "AAPI share grew nearly 8x from 2000 to 2020. One census tract jumped from 0.7% to 43.7%.",
  },
  whitfield: {
    name: "Whitfield",
    fips: "13313",
    pop2020: 102864,
    shares: { white: 55.7, black: 4.5, latino: 37.5, aapi: 1.8 },
    note: "Dalton has one of the highest Latino population shares of any GA county.",
  },
};

// Statewide population growth 2010-2020 (Census)
export const STATE_GROWTH = {
  white: -4.0,
  black: 12.5,
  latino: 31.6,
  aapi: 52.3,
};

export interface CrackingCase {
  id: string;
  county: keyof typeof COUNTIES;
  level: "Congressional" | "State Senate" | "State House" | "County Commission";
  district: string;
  type: "Cracking" | "Packing" | "Dilution" | "Fake-majority" | "Coalition-dismantling";
  affects: Group[];
  headline: string;
  detail: string;
  metrics: { label: string; before?: string; after?: string; value?: string }[];
  geography: string[]; // named communities
  source: { label: string; url: string };
  severity: 1 | 2 | 3; // 3 = most severe
}

export const CASES: CrackingCase[] = [
  // GWINNETT
  {
    id: "gw-cd7-cd9",
    county: "gwinnett",
    level: "Congressional",
    district: "CD-7 → CD-9",
    type: "Cracking",
    affects: ["latino", "aapi", "black"],
    headline: "283,464 people moved out of CD-7 into majority-White CD-9",
    detail:
      "Map drawers moved 283,464 people — 85% of them from Gwinnett, 54% people of color — out of the old CD-7 and into majority-White CD-9. The coalition that elected Lucy McBath was surgically dispersed.",
    metrics: [
      { label: "People moved", value: "283,464" },
      { label: "From Gwinnett", value: "85%" },
      { label: "People of color", value: "54%" },
    ],
    geography: ["Lawrenceville", "Norcross", "Lilburn", "Duluth"],
    source: {
      label: "Lawyers' Committee complaint (Dec 2021)",
      url: "https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf",
    },
    severity: 3,
  },
  {
    id: "gw-sd48",
    county: "gwinnett",
    level: "State Senate",
    district: "SD-48",
    type: "Dilution",
    affects: ["aapi"],
    headline: "AAPI coalition district gutted by 13.4 points",
    detail:
      "SD-48 was previously a coalition district with 27.6% AAPI population. Map drawers removed high-population-of-color areas around Duluth and added the northern Gwinnett/Forsyth corner around Sugar Hill. People-of-color share dropped 13.4 percentage points.",
    metrics: [
      { label: "AAPI share (before)", value: "27.6%" },
      { label: "POC change", value: "−13.4 pts" },
    ],
    geography: ["Duluth", "Johns Creek", "Sugar Hill", "Forsyth"],
    source: {
      label: "Lawyers' Committee complaint",
      url: "https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf",
    },
    severity: 3,
  },
  {
    id: "gw-hd98",
    county: "gwinnett",
    level: "State House",
    district: "HD-98",
    type: "Fake-majority",
    affects: ["latino", "aapi"],
    headline: "A 'majority-Latinx' district that doesn't perform",
    detail:
      "HD-98 (Norcross area) was drawn as 57.42% Latinx by total population. But Latinx CVAP was only 23.53% and AAPI CVAP 23.5%. On paper a Latino-majority district. In practice, neither community can elect candidates of choice.",
    metrics: [
      { label: "Latinx total pop", value: "57.4%" },
      { label: "Latinx CVAP", value: "23.5%" },
      { label: "AAPI CVAP", value: "23.5%" },
    ],
    geography: ["Norcross"],
    source: {
      label: "Lawyers' Committee complaint",
      url: "https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf",
    },
    severity: 3,
  },
  {
    id: "gw-2023-dismantle",
    county: "gwinnett",
    level: "Congressional",
    district: "CD-6 / CD-7 (2023 redraw)",
    type: "Coalition-dismantling",
    affects: ["latino", "aapi", "black"],
    headline: "2023 court-ordered redraw dismantled the Gwinnett coalition district",
    detail:
      "When a federal court ordered new Black-opportunity districts after Alpha Phi Alpha, the GOP preserved its overall seat count by dismantling Gwinnett's coalition district. The Republican redistricting chair: 'The only minority they were talking about in this case was Black voters.'",
    metrics: [{ label: "Coalition districts lost", value: "1" }],
    geography: ["Norcross", "Lilburn", "Duluth", "Lawrenceville"],
    source: {
      label: "NPR (Dec 2023)",
      url: "https://www.npr.org/2023/12/20/1220384013/georgia-redistricting-voting-rights-act-coalition-districts",
    },
    severity: 3,
  },
  {
    id: "gw-commission",
    county: "gwinnett",
    level: "County Commission",
    district: "All 4 commission districts",
    type: "Cracking",
    affects: ["latino", "aapi", "black"],
    headline: "Lawrenceville split 3 ways. Norcross split 2 ways. New majority-White district.",
    detail:
      "The 2022 county commission map split Lawrenceville into three districts and Norcross into two — both diverse municipalities. A new majority-White district was carved around Buford and Suwanee in northern Gwinnett.",
    metrics: [
      { label: "Lawrenceville split", value: "3 ways" },
      { label: "Norcross split", value: "2 ways" },
    ],
    geography: ["Lawrenceville", "Norcross", "Buford", "Suwanee"],
    source: {
      label: "Atlanta Voice (Feb 2022)",
      url: "https://theatlantavoice.com/republicans-take-cobb-and-gwinnett-redistricting-fights-to-the-state-capitol/",
    },
    severity: 2,
  },

  // HALL
  {
    id: "hall-gainesville",
    county: "hall",
    level: "State House",
    district: "HD-28, 29, 30, 31",
    type: "Cracking",
    affects: ["latino"],
    headline: "Gainesville's Latino community cracked four ways",
    detail:
      "The City of Gainesville and neighboring Latino areas were sliced into four state House districts. All four kept a majority-White CVAP and majority-White registered voter share. Textbook cracking.",
    metrics: [
      { label: "Districts splitting the city", value: "4" },
      { label: "Districts performing for Latinos", value: "0" },
    ],
    geography: ["Gainesville"],
    source: {
      label: "Lawyers' Committee complaint",
      url: "https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf",
    },
    severity: 3,
  },

  // COBB
  {
    id: "cobb-sd56-14",
    county: "cobb",
    level: "State Senate",
    district: "SD-56 / SD-14",
    type: "Dilution",
    affects: ["latino", "aapi", "black"],
    headline: "SD-56 lost 14.56 points of POC voting-age population",
    detail:
      "Map drawers surgically removed diverse areas from SD-56 and moved them into SD-14. But SD-14 was not drawn as a coalition district either — the move just dispersed voters of color rather than creating opportunity anywhere.",
    metrics: [{ label: "SD-56 POC VAP change", value: "−14.56 pts" }],
    geography: ["Cobb County (east)"],
    source: {
      label: "Lawyers' Committee complaint",
      url: "https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf",
    },
    severity: 2,
  },
  {
    id: "cobb-sd33",
    county: "cobb",
    level: "State Senate",
    district: "SD-33 (Marietta)",
    type: "Packing",
    affects: ["latino", "aapi", "black"],
    headline: "Marietta split into 4 Senate districts; SD-33 packed at 74% POC",
    detail:
      "Marietta is split four ways at the Senate level. SD-33 is packed at 74% people of color, which prevents POC voters from having influence in neighboring SD-6, SD-32, and SD-37.",
    metrics: [
      { label: "Senate districts splitting Marietta", value: "4" },
      { label: "SD-33 POC share", value: "74%" },
    ],
    geography: ["Marietta"],
    source: {
      label: "Lawyers' Committee complaint",
      url: "https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf",
    },
    severity: 2,
  },
  {
    id: "cobb-cd11",
    county: "cobb",
    level: "Congressional",
    district: "CD-11",
    type: "Cracking",
    affects: ["latino", "aapi", "black"],
    headline: "Diversifying Cobb suburbs paired with rural White counties",
    detail:
      "CD-11 pairs the center of Cobb County and cities along I-75 (Marietta, Smyrna, Powder Springs, Austell) with majority-White Cherokee, Bartow, and Pickens counties — preserving the cracking of growing communities of color.",
    metrics: [{ label: "Diluted city centers", value: "4" }],
    geography: ["Marietta", "Smyrna", "Powder Springs", "Austell"],
    source: {
      label: "Lawyers' Committee complaint",
      url: "https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf",
    },
    severity: 2,
  },

  // FORSYTH
  {
    id: "forsyth-hd25",
    county: "forsyth",
    level: "State House",
    district: "HD-25 (North Fulton / South Forsyth)",
    type: "Dilution",
    affects: ["aapi"],
    headline: "AAPI opportunity district denied at the fastest-growing AAPI corridor",
    detail:
      "HD-25 paired growing AAPI population centers in North Fulton and South Forsyth with majority-White areas. Forsyth's AAPI share grew from <1% in 2000 to ~18% in 2020 — one census tract jumped from 0.7% to 43.7% AAPI. Plaintiffs argued this could have been an AAPI opportunity coalition district. It wasn't drawn that way.",
    metrics: [
      { label: "Forsyth AAPI 2000", value: "0.78%" },
      { label: "Forsyth AAPI 2020", value: "17.95%" },
      { label: "Peak tract jump", value: "+43 pts" },
    ],
    geography: ["South Forsyth", "North Fulton", "Johns Creek"],
    source: {
      label: "Lawyers' Committee complaint",
      url: "https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf",
    },
    severity: 3,
  },

  // WHITFIELD
  {
    id: "whit-hd4",
    county: "whitfield",
    level: "State House",
    district: "HD-4 (Dalton)",
    type: "Fake-majority",
    affects: ["latino"],
    headline: "A 'majority-Latinx' district where Latino voters can't actually elect",
    detail:
      "HD-4 was drawn at 50.07% Latinx by total population. But Latinx CVAP was only 25.41% and Latinx registered voters 35.10%. The numbers were arranged to claim a majority-Latino district existed — without giving Latino voters a meaningful opportunity to elect candidates of choice.",
    metrics: [
      { label: "Latinx total pop", value: "50.1%" },
      { label: "Latinx CVAP", value: "25.4%" },
      { label: "Latinx reg. voters", value: "35.1%" },
    ],
    geography: ["Dalton"],
    source: {
      label: "Lawyers' Committee complaint",
      url: "https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf",
    },
    severity: 3,
  },
];

// Unity Maps proposed but not adopted
export const UNITY_DENIED = [
  {
    title: "AAPI Opportunity Senate District",
    where: "Forsyth / Gwinnett / Fulton tri-county meeting point",
    status: "Proposed by NAACP + GALEO + People's Agenda + Urban League. Not adopted.",
  },
  {
    title: "Majority-Latino Senate District",
    where: "Northern DeKalb + western Gwinnett",
    status: "Proposed by NAACP + GALEO + People's Agenda + Urban League. Not adopted.",
  },
];
