export const REGIONS = {
  west_bengal: {
    name: "West Bengal (Bay of Bengal)",
    bounds: [
      [20.5, 86.5],
      [22.7, 89.0],
    ],
    center: [21.8, 87.75],
  },
  goa: {
    name: "Goa (Arabian Sea)",
    bounds: [
      [14.8, 73.6],
      [15.8, 74.4],
    ],
    center: [15.3, 74.0],
  },
  mumbai: {
    name: "Mumbai/Maharashtra (Arabian Sea)",
    bounds: [
      [18.5, 72.5],
      [20.0, 73.4],
    ],
    center: [19.2, 73.0],
  },
  andaman: {
    name: "Andaman & Nicobar Islands (Andaman Sea)",
    bounds: [
      [6.5, 92.0],
      [13.5, 94.5],
    ],
    center: [10.0, 93.2],
  },
  lakshadweep: {
    name: "Lakshadweep Islands (Laccadive Sea)",
    bounds: [
      [8.0, 72.0],
      [12.5, 74.0],
    ],
    center: [10.2, 73.0],
  },
  gujarat: {
    name: "Gujarat (Arabian Sea)",
    bounds: [
      [20.0, 68.0],
      [23.5, 72.0],
    ],
    center: [21.8, 70.0],
  },
  karnataka: {
    name: "Karnataka (Arabian Sea)",
    bounds: [
      [13.8, 74.0],
      [15.0, 75.0],
    ],
    center: [14.4, 74.5],
  },
  kerala: {
    name: "Kerala (Arabian Sea)",
    bounds: [
      [8.0, 76.2],
      [12.0, 77.2],
    ],
    center: [10.0, 76.7],
  },
  tamil_nadu: {
    name: "Tamil Nadu (Bay of Bengal)",
    bounds: [
      [8.0, 77.3],
      [12.5, 80.3],
    ],
    center: [10.3, 78.8],
  },
  andhra_pradesh: {
    name: "Andhra Pradesh (Bay of Bengal)",
    bounds: [
      [13.0, 80.0],
      [18.0, 84.0],
    ],
    center: [15.5, 82.0],
  },
  odisha: {
    name: "Odisha (Bay of Bengal)",
    bounds: [
      [18.0, 84.5],
      [21.5, 87.0],
    ],
    center: [19.7, 85.7],
  },
  puducherry: {
    name: "Puducherry (Bay of Bengal)",
    bounds: [
      [11.8, 79.6],
      [12.2, 79.9],
    ],
    center: [12.0, 79.75],
  },
  daman_diu: {
    name: "Daman & Diu (Arabian Sea)",
    bounds: [
      [20.3, 72.6],
      [20.7, 72.9],
    ],
    center: [20.5, 72.75],
  },
};

export const SIGHTINGS = [
  // ORIGINAL SPECIES DATA
  {
    speciesId: "setipinna_tenuifilis",
    species: "Setipinna tenuifilis",
    regionKey: "west_bengal",
    lat: 21.9,
    lng: 88.5,
  },
  {
    speciesId: "setipinna_tenuifilis",
    species: "Setipinna tenuifilis",
    regionKey: "west_bengal",
    lat: 21.5,
    lng: 87.9,
  },

  {
    speciesId: "euterpina_acutifrons",
    species: "Euterpina acutifrons",
    regionKey: "goa",
    lat: 15.4,
    lng: 73.8,
  },
  {
    speciesId: "euterpina_acutifrons",
    species: "Euterpina acutifrons",
    regionKey: "goa",
    lat: 15.1,
    lng: 74.1,
  },

  {
    speciesId: "muraenesox_cinereus",
    species: "Muraenesox cinereus",
    regionKey: "mumbai",
    lat: 18.9,
    lng: 72.8,
  },
  {
    speciesId: "muraenesox_cinereus",
    species: "Muraenesox cinereus",
    regionKey: "mumbai",
    lat: 19.5,
    lng: 73.1,
  },
  {
    speciesId: "muraenesox_cinereus",
    species: "Muraenesox cinereus",
    regionKey: "mumbai",
    lat: 19.1,
    lng: 72.9,
  },

  {
    speciesId: "nototeredo_edax",
    species: "Nototeredo edax",
    regionKey: "andaman",
    lat: 11.6,
    lng: 92.7,
  },
  {
    speciesId: "nototeredo_edax",
    species: "Nototeredo edax",
    regionKey: "andaman",
    lat: 12.5,
    lng: 93.1,
  },

  {
    speciesId: "fiona_genus",
    species: "Fiona (genus)",
    regionKey: "lakshadweep",
    lat: 10.5,
    lng: 72.6,
  },
  {
    speciesId: "fiona_genus",
    species: "Fiona (genus)",
    regionKey: "lakshadweep",
    lat: 11.2,
    lng: 73.1,
  },

  {
    speciesId: "thunnus_albacares",
    species: "Thunnus albacares",
    regionKey: "andaman",
    lat: 10.8,
    lng: 92.9,
  },
  {
    speciesId: "thunnus_albacares",
    species: "Thunnus albacares",
    regionKey: "andaman",
    lat: 9.5,
    lng: 93.4,
  },
  {
    speciesId: "thunnus_albacares",
    species: "Thunnus albacares",
    regionKey: "lakshadweep",
    lat: 10.7,
    lng: 72.8,
  },
  {
    speciesId: "thunnus_albacares",
    species: "Thunnus albacares",
    regionKey: "goa",
    lat: 15.5,
    lng: 73.9,
  },

  {
    speciesId: "scomberomorus_commerson",
    species: "Scomberomorus commerson",
    regionKey: "mumbai",
    lat: 19.2,
    lng: 72.7,
  },
  {
    speciesId: "scomberomorus_commerson",
    species: "Scomberomorus commerson",
    regionKey: "goa",
    lat: 15.3,
    lng: 73.7,
  },
  {
    speciesId: "scomberomorus_commerson",
    species: "Scomberomorus commerson",
    regionKey: "west_bengal",
    lat: 21.2,
    lng: 88.1,
  },

  {
    speciesId: "coryphaena_hippurus",
    species: "Coryphaena hippurus",
    regionKey: "lakshadweep",
    lat: 10.8,
    lng: 73.3,
  },
  {
    speciesId: "coryphaena_hippurus",
    species: "Coryphaena hippurus",
    regionKey: "lakshadweep",
    lat: 11.5,
    lng: 72.9,
  },
  {
    speciesId: "coryphaena_hippurus",
    species: "Coryphaena hippurus",
    regionKey: "goa",
    lat: 15.6,
    lng: 74.0,
  },

  {
    speciesId: "katsuwonus_pelamis",
    species: "Katsuwonus pelamis",
    regionKey: "andaman",
    lat: 11.2,
    lng: 93.5,
  },
  {
    speciesId: "katsuwonus_pelamis",
    species: "Katsuwonus pelamis",
    regionKey: "andaman",
    lat: 12.1,
    lng: 92.9,
  },
  {
    speciesId: "katsuwonus_pelamis",
    species: "Katsuwonus pelamis",
    regionKey: "lakshadweep",
    lat: 9.8,
    lng: 72.5,
  },

  {
    speciesId: "lutjanus_argentimaculatus",
    species: "Lutjanus argentimaculatus",
    regionKey: "west_bengal",
    lat: 21.7,
    lng: 88.3,
  },
  {
    speciesId: "lutjanus_argentimaculatus",
    species: "Lutjanus argentimaculatus",
    regionKey: "mumbai",
    lat: 18.7,
    lng: 72.9,
  },
  {
    speciesId: "lutjanus_argentimaculatus",
    species: "Lutjanus argentimaculatus",
    regionKey: "mumbai",
    lat: 19.3,
    lng: 73.2,
  },

  {
    speciesId: "epinephelus_diacanthus",
    species: "Epinephelus diacanthus",
    regionKey: "goa",
    lat: 15.2,
    lng: 74.2,
  },
  {
    speciesId: "epinephelus_diacanthus",
    species: "Epinephelus diacanthus",
    regionKey: "goa",
    lat: 15.7,
    lng: 73.9,
  },
  {
    speciesId: "epinephelus_diacanthus",
    species: "Epinephelus diacanthus",
    regionKey: "mumbai",
    lat: 18.8,
    lng: 73.0,
  },

  {
    speciesId: "rastrelliger_kanagurta",
    species: "Rastrelliger kanagurta",
    regionKey: "west_bengal",
    lat: 22.1,
    lng: 87.7,
  },
  {
    speciesId: "rastrelliger_kanagurta",
    species: "Rastrelliger kanagurta",
    regionKey: "mumbai",
    lat: 19.6,
    lng: 72.8,
  },
  {
    speciesId: "rastrelliger_kanagurta",
    species: "Rastrelliger kanagurta",
    regionKey: "goa",
    lat: 15.0,
    lng: 74.0,
  },
  {
    speciesId: "rastrelliger_kanagurta",
    species: "Rastrelliger kanagurta",
    regionKey: "andaman",
    lat: 13.1,
    lng: 93.2,
  },
  {
    speciesId: "rastrelliger_kanagurta",
    species: "Rastrelliger kanagurta",
    regionKey: "lakshadweep",
    lat: 10.1,
    lng: 73.5,
  },

  {
    speciesId: "sphyraena_jello",
    species: "Sphyraena jello",
    regionKey: "andaman",
    lat: 8.9,
    lng: 92.5,
  },
  {
    speciesId: "sphyraena_jello",
    species: "Sphyraena jello",
    regionKey: "andaman",
    lat: 10.2,
    lng: 93.8,
  },
  {
    speciesId: "sphyraena_jello",
    species: "Sphyraena jello",
    regionKey: "mumbai",
    lat: 19.9,
    lng: 72.7,
  },

  {
    speciesId: "tenualosa_ilisha",
    species: "Tenualosa ilisha",
    regionKey: "west_bengal",
    lat: 22.5,
    lng: 88.7,
  },
  {
    speciesId: "tenualosa_ilisha",
    species: "Tenualosa ilisha",
    regionKey: "west_bengal",
    lat: 21.3,
    lng: 87.6,
  },
  {
    speciesId: "tenualosa_ilisha",
    species: "Tenualosa ilisha",
    regionKey: "west_bengal",
    lat: 22.2,
    lng: 88.1,
  },
  {
    speciesId: "tenualosa_ilisha",
    species: "Tenualosa ilisha",
    regionKey: "west_bengal",
    lat: 21.6,
    lng: 87.8,
  },

  {
    speciesId: "pampus_argenteus",
    species: "Pampus argenteus",
    regionKey: "mumbai",
    lat: 19.0,
    lng: 73.0,
  },
  {
    speciesId: "pampus_argenteus",
    species: "Pampus argenteus",
    regionKey: "mumbai",
    lat: 19.7,
    lng: 72.6,
  },
  {
    speciesId: "pampus_argenteus",
    species: "Pampus argenteus",
    regionKey: "west_bengal",
    lat: 21.1,
    lng: 88.9,
  },

  // EXTENDED TO NEW REGIONS
  // Only existing species used
  {
    speciesId: "katsuwonus_pelamis",
    species: "Katsuwonus pelamis",
    regionKey: "gujarat",
    lat: 22.2,
    lng: 69.0,
  },
  {
    speciesId: "scomberomorus_commerson",
    species: "Scomberomorus commerson",
    regionKey: "gujarat",
    lat: 21.0,
    lng: 70.2,
  },

  {
    speciesId: "coryphaena_hippurus",
    species: "Coryphaena hippurus",
    regionKey: "karnataka",
    lat: 14.4,
    lng: 74.3,
  },
  {
    speciesId: "rastrelliger_kanagurta",
    species: "Rastrelliger kanagurta",
    regionKey: "karnataka",
    lat: 14.8,
    lng: 74.5,
  },

  {
    speciesId: "epinephelus_diacanthus",
    species: "Epinephelus diacanthus",
    regionKey: "kerala",
    lat: 9.5,
    lng: 76.3,
  },
  {
    speciesId: "katsuwonus_pelamis",
    species: "Katsuwonus pelamis",
    regionKey: "kerala",
    lat: 10.8,
    lng: 76.4,
  },

  {
    speciesId: "thunnus_albacares",
    species: "Thunnus albacares",
    regionKey: "tamil_nadu",
    lat: 10.0,
    lng: 78.5,
  },
  {
    speciesId: "epinephelus_diacanthus",
    species: "Epinephelus diacanthus",
    regionKey: "tamil_nadu",
    lat: 11.5,
    lng: 79.6,
  },

  {
    speciesId: "lutjanus_argentimaculatus",
    species: "Lutjanus argentimaculatus",
    regionKey: "andhra_pradesh",
    lat: 16.2,
    lng: 82.4,
  },
  {
    speciesId: "rastrelliger_kanagurta",
    species: "Rastrelliger kanagurta",
    regionKey: "andhra_pradesh",
    lat: 17.1,
    lng: 83.0,
  },

  {
    speciesId: "sphyraena_jello",
    species: "Sphyraena jello",
    regionKey: "odisha",
    lat: 20.1,
    lng: 86.2,
  },
  {
    speciesId: "pampus_argenteus",
    species: "Pampus argenteus",
    regionKey: "odisha",
    lat: 19.5,
    lng: 85.8,
  },

  {
    speciesId: "tenualosa_ilisha",
    species: "Tenualosa ilisha",
    regionKey: "puducherry",
    lat: 12.0,
    lng: 79.8,
  },
  {
    speciesId: "coryphaena_hippurus",
    species: "Coryphaena hippurus",
    regionKey: "puducherry",
    lat: 11.9,
    lng: 79.7,
  },

  {
    speciesId: "fiona_genus",
    species: "Fiona (genus)",
    regionKey: "daman_diu",
    lat: 20.6,
    lng: 72.8,
  },
  {
    speciesId: "rastrelliger_kanagurta",
    species: "Rastrelliger kanagurta",
    regionKey: "daman_diu",
    lat: 20.4,
    lng: 72.7,
  },
];
