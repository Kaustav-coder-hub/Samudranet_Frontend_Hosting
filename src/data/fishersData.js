const fishingLocations = [
  {
    name: "Kakdwip Fishing Harbour",
    region: "West Bengal",
    lat: 21.65,
    lng: 88.17,
  },
  {
    name: "Petuaghat Fishing Harbour",
    region: "West Bengal",
    lat: 21.63,
    lng: 87.75,
  },
  {
    name: "Cochin Fishing Port",
    region: "Kerala",
    lat: 9.975,
    lng: 76.275,
  },
  {
    name: "Vizhinjam Fishing Harbour",
    region: "Kerala",
    lat: 8.389,
    lng: 77.0095,
  },
  {
    name: "Chennai Fishing Harbour",
    region: "Tamil Nadu",
    lat: 13.1067,
    lng: 80.295,
  },
  {
    name: "Tuticorin Fishing Port",
    region: "Tamil Nadu",
    lat: 8.7642,
    lng: 78.1348,
  },
  {
    name: "Veraval Fishing Harbour",
    region: "Gujarat",
    lat: 20.905,
    lng: 70.3628,
  },
  {
    name: "Porbandar Fishing Harbour",
    region: "Gujarat",
    lat: 21.6417,
    lng: 69.6093,
  },
  {
    name: "Sassoon Dock",
    region: "Maharashtra",
    lat: 18.9126,
    lng: 72.8312,
  },
  {
    name: "Ratnagiri Fishing Port",
    region: "Maharashtra",
    lat: 17.0006,
    lng: 73.27,
  },
  {
    name: "Vasco da Gama Fishing Dock",
    region: "Goa",
    lat: 15.4025,
    lng: 73.8,
  },
  {
    name: "Visakhapatnam Fishing Harbour",
    region: "Andhra Pradesh",
    lat: 17.6968,
    lng: 83.301,
  },
  {
    name: "Paradeep Fishing Harbour",
    region: "Odisha",
    lat: 20.3165,
    lng: 86.6165,
  },
  {
    name: "Mangalore Fishing Port",
    region: "Karnataka",
    lat: 12.8698,
    lng: 74.8383,
  },
  {
    name: "Port Blair Fishing Base",
    region: "Andaman & Nicobar",
    lat: 11.6683,
    lng: 92.7378,
  },
];

function generateNearbyLocations(baseLat, baseLng, count, region) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;

    result.push({
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset,
      region: region,
      speciesId: getRandomSpeciesId(),
      fishingSpot: true,
      catchRate: Math.floor(Math.random() * 90) + 10, 
    });
  }
  return result;
}

function getRandomSpeciesId() {
  const speciesIds = [
    "setipinna_tenuifilis",
    "euterpina_acutifrons",
    "muraenesox_cinereus",
    "nototeredo_edax",
    "fiona_genus",
    "thryssa_hamiltonii",
    "pseudapocryptes_elongatus",
    "hemiramphus_far",
    "tilapia_sp",
    "chanos_chanos",
  ];
  return speciesIds[Math.floor(Math.random() * speciesIds.length)];
}

export const FISHING_SPOTS = fishingLocations.flatMap((location) =>
  generateNearbyLocations(location.lat, location.lng, 3, location.region)
);

export const FISHER_MAP_STYLE = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "", 
  maxZoom: 19,
};


export const RESEARCHER_MAP_STYLE = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "",
  maxZoom: 19,
};
