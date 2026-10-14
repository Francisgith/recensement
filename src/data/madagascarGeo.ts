export interface DistrictInfo {
  nom: string
  communes: string[]
}

export interface RegionInfo {
  nom: string
  chefLieu: string
  districts: DistrictInfo[]
}

export interface ProvinceInfo {
  nom: string
  chefLieu: string
  regions: RegionInfo[]
}

export const MADAGASCAR_DIVISIONS: ProvinceInfo[] = [
  {
    nom: 'Antananarivo',
    chefLieu: 'Antananarivo',
    regions: [
      {
        nom: 'Analamanga',
        chefLieu: 'Antananarivo',
        districts: [
          {
            nom: 'Antananarivo Renivohitra',
            communes: [
              '1er Arrondissement (Analakely, Soarano)',
              '2ème Arrondissement (Ambanidia, Manakambahiny)',
              '3ème Arrondissement (Antaninandro, Ankadifotsy)',
              '4ème Arrondissement (Mahamasina, Anosy)',
              '5ème Arrondissement (Ambatomainty, Analamahitsy)',
              '6ème Arrondissement (Ambohimanarina)',
            ],
          },
          {
            nom: 'Ambohidratrimo',
            communes: ['Ambohidratrimo', 'Ivato Aéroport', 'Talatamaty', 'Ampangabe', 'Mahitsy'],
          },
          {
            nom: 'Andramasina',
            communes: ['Andramasina', 'Alatsinainy Bakaro', 'Sabotsy Manjakavahoaka'],
          },
          {
            nom: 'Anjozorobe',
            communes: ['Anjozorobe', 'Alakamisy', 'Ambohimirary', 'Betioky'],
          },
          {
            nom: 'Ankazobe',
            communes: ['Ankazobe', 'Ambohitromby', 'Fihaonana', 'Kiangara'],
          },
          {
            nom: 'Manjakandriana',
            communes: ['Manjakandriana', 'Alarobia', 'Ambohitrandriamanitra', 'Mantasoa', 'Nandihizana'],
          },
        ],
      },
      {
        nom: 'Vakinankaratra',
        chefLieu: 'Antsirabe',
        districts: [
          {
            nom: 'Antsirabe I',
            communes: ['Antsirabe Centre', 'Ivohitra', 'Mahazoarivo', 'Soamalaza'],
          },
          {
            nom: 'Antsirabe II',
            communes: ['Ambohibary', 'Ampatsakana', 'Antanambao', 'Vinaninkarena'],
          },
          {
            nom: 'Ambatolampy',
            communes: ['Ambatolampy', 'Belambo', 'Manjakatompo', 'Tsiafajavona'],
          },
          {
            nom: 'Betafo',
            communes: ['Betafo', 'Alakamisy Anativato', 'Inanantonana', 'Mandritsara'],
          },
          {
            nom: 'Faratsiho',
            communes: ['Faratsiho', 'Ambohiborona', 'Miandrarivo'],
          },
          {
            nom: 'Mandoto',
            communes: ['Mandoto', 'Anjoma Ramartina', 'Fidirana'],
          },
        ],
      },
      {
        nom: 'Itasy',
        chefLieu: 'Miarinarivo',
        districts: [
          {
            nom: 'Miarinarivo',
            communes: ['Miarinarivo', 'Analavory', 'Manazary', 'Sarobaratra'],
          },
          {
            nom: 'Arivonimamo',
            communes: ['Arivonimamo', 'Ambatomirahavavy', 'Imerintsiatosika', 'Mahatsinjo'],
          },
          {
            nom: 'Soavinandriana',
            communes: ['Soavinandriana', 'Ampefy', 'Ankadinondry Sakay', 'Dondona'],
          },
        ],
      },
      {
        nom: 'Bongolava',
        chefLieu: 'Tsiroanomandidy',
        districts: [
          {
            nom: 'Tsiroanomandidy',
            communes: ['Tsiroanomandidy', 'Ankadinondry', 'Belobaka', 'Mahasolo'],
          },
          {
            nom: 'Fenoarivobe',
            communes: ['Fenoarivobe', 'Ambohimalaza', 'Firavahana'],
          },
        ],
      },
    ],
  },
  {
    nom: 'Antsiranana',
    chefLieu: 'Antsiranana',
    regions: [
      {
        nom: 'Diana',
        chefLieu: 'Antsiranana (Diego-Suarez)',
        districts: [
          {
            nom: 'Antsiranana I',
            communes: ['Bazarikely', 'Tanambao', 'Scama', 'Ambohimitsinjo'],
          },
          {
            nom: 'Antsiranana II',
            communes: ['Ankarongana', 'Mahavanona', 'Ramena', 'Sadjoavato'],
          },
          {
            nom: 'Ambanja',
            communes: ['Ambanja', 'Ambalahonko', 'Ankaramy', 'Bemanevika'],
          },
          {
            nom: 'Ambilobe',
            communes: ['Ambilobe', 'Anaborano', 'Sirama', 'Mantaly'],
          },
          {
            nom: 'Nosy Be',
            communes: ['Hell-Ville (Andoany)', 'Ambatoloaka', 'Djamandjary', 'Dzamandzar'],
          },
        ],
      },
      {
        nom: 'Sava',
        chefLieu: 'Sambava',
        districts: [
          {
            nom: 'Sambava',
            communes: ['Sambava Centre', 'Ambodiampana', 'Anjangoveratra', 'Nosiarina'],
          },
          {
            nom: 'Antalaha',
            communes: ['Antalaha', 'Ambohitralanana', 'Ampahana', 'Cap Est'],
          },
          {
            nom: 'Vohemar',
            communes: ['Vohemar', 'Ampanefena', 'Daraina', 'Fanambana'],
          },
          {
            nom: 'Andapa',
            communes: ['Andapa', 'Ambodiangezoka', 'Doany', 'Tanandava'],
          },
        ],
      },
    ],
  },
  {
    nom: 'Toamasina',
    chefLieu: 'Toamasina',
    regions: [
      {
        nom: 'Atsinanana',
        chefLieu: 'Toamasina (Tamatave)',
        districts: [
          {
            nom: 'Toamasina I',
            communes: ['Tanambao', 'Ankirihiry', 'Mangarivotra', 'Salazamay'],
          },
          {
            nom: 'Toamasina II',
            communes: ['Ambodiriana', 'Fanandrana', 'Toamasina Suburbaine'],
          },
          {
            nom: 'Brickaville',
            communes: ['Brickaville', 'Anivorano Est', 'Maromambo'],
          },
          {
            nom: 'Mahanoro',
            communes: ['Mahanoro', 'Ambinanidilana', 'Ambodiharina'],
          },
          {
            nom: 'Vatomandry',
            communes: ['Vatomandry', 'Ambodivoananto', 'Ilaka Est'],
          },
        ],
      },
      {
        nom: 'Analanjirofo',
        chefLieu: 'Fénérive-Est',
        districts: [
          {
            nom: 'Fénérive-Est',
            communes: ['Fénérive-Est', 'Ampasina Maningory', 'Mahambo', 'Vohipeno'],
          },
          {
            nom: 'Maroantsetra',
            communes: ['Maroantsetra', 'Ambanizana', 'Anjanazana', 'Rantabe'],
          },
          {
            nom: 'Sainte-Marie',
            communes: ['Ambodifotatra', 'Lokintsy', 'Saint-Joseph'],
          },
          {
            nom: 'Mananara Nord',
            communes: ['Mananara Nord', 'Antanambe', 'Sandrakatsy'],
          },
        ],
      },
      {
        nom: 'Alaotra-Mangoro',
        chefLieu: 'Ambatondrazaka',
        districts: [
          {
            nom: 'Ambatondrazaka',
            communes: ['Ambatondrazaka', 'Ambatosoratra', 'Imerimandroso'],
          },
          {
            nom: 'Moramanga',
            communes: ['Moramanga', 'Andasibe', 'Ampasimpotsy', 'Beparasy'],
          },
          {
            nom: 'Amparafaravola',
            communes: ['Amparafaravola', 'Ambohitrarivo', 'Morarano Kraoma'],
          },
        ],
      },
    ],
  },
  {
    nom: 'Mahajanga',
    chefLieu: 'Mahajanga',
    regions: [
      {
        nom: 'Boeny',
        chefLieu: 'Mahajanga (Majunga)',
        districts: [
          {
            nom: 'Mahajanga I',
            communes: ['Mahajanga Ville', 'Mangarivotra', 'Tsararano', 'Amborovy'],
          },
          {
            nom: 'Mahajanga II',
            communes: ['Ambalakida', 'Belobaka', 'Betsako'],
          },
          {
            nom: 'Marovoay',
            communes: ['Marovoay', 'Ambolomoty', 'Ankazomborona'],
          },
          {
            nom: 'Ambato-Boeny',
            communes: ['Ambato-Boeny', 'Ankijabe', 'Madirovalo'],
          },
        ],
      },
      {
        nom: 'Sofia',
        chefLieu: 'Antsohihy',
        districts: [
          {
            nom: 'Antsohihy',
            communes: ['Antsohihy', 'Ambodimanga', 'Ankerika'],
          },
          {
            nom: 'Port-Bergé',
            communes: ['Port-Bergé (Boriziny)', 'Ambodiampana', 'Tsaratanana'],
          },
          {
            nom: 'Mandritsara',
            communes: ['Mandritsara', 'Antanambaovao', 'Kalandy'],
          },
        ],
      },
      {
        nom: 'Betsiboka',
        chefLieu: 'Maevatanana',
        districts: [
          {
            nom: 'Maevatanana',
            communes: ['Maevatanana', 'Ambalanjanakomby', 'Morafeno'],
          },
          {
            nom: 'Tsaratanana',
            communes: ['Tsaratanana', 'Brieville', 'Keliloha'],
          },
        ],
      },
      {
        nom: 'Melaky',
        chefLieu: 'Maintirano',
        districts: [
          {
            nom: 'Maintirano',
            communes: ['Maintirano', 'Andranovao', 'Betanatanana'],
          },
          {
            nom: 'Antsalova',
            communes: ['Antsalova', 'Bekopaka', 'Trangahy'],
          },
        ],
      },
    ],
  },
  {
    nom: 'Fianarantsoa',
    chefLieu: 'Fianarantsoa',
    regions: [
      {
        nom: 'Haute Matsiatra',
        chefLieu: 'Fianarantsoa',
        districts: [
          {
            nom: 'Fianarantsoa',
            communes: ['Fianarantsoa Ville', 'Ambalapaiso', 'Isaha', 'Talatamaty'],
          },
          {
            nom: 'Ambalavao',
            communes: ['Ambalavao', 'Ambinanindrano', 'Ankaramena'],
          },
          {
            nom: 'Ambohimahasoa',
            communes: ['Ambohimahasoa', 'Befeta', 'Camp Robin'],
          },
        ],
      },
      {
        nom: 'Amoron\'i Mania',
        chefLieu: 'Ambositra',
        districts: [
          {
            nom: 'Ambositra',
            communes: ['Ambositra', 'Ambatofitorahana', 'Ilaka Centre'],
          },
          {
            nom: 'Fandriana',
            communes: ['Fandriana', 'Alakamisy', 'Sandrandahy'],
          },
        ],
      },
      {
        nom: 'Vatovavy',
        chefLieu: 'Mananjary',
        districts: [
          {
            nom: 'Mananjary',
            communes: ['Mananjary', 'Ambalahosy Nord', 'Kianjavato'],
          },
          {
            nom: 'Ifanadiana',
            communes: ['Ifanadiana', 'Ranomafana', 'Tsaratanana'],
          },
        ],
      },
      {
        nom: 'Fitovinany',
        chefLieu: 'Manakara',
        districts: [
          {
            nom: 'Manakara',
            communes: ['Manakara', 'Ampasimanjeva', 'Lokomby'],
          },
          {
            nom: 'Vohipeno',
            communes: ['Vohipeno', 'Ankarimbary', 'Ifatsy'],
          },
        ],
      },
      {
        nom: 'Atsimo-Atsinanana',
        chefLieu: 'Farafangana',
        districts: [
          {
            nom: 'Farafangana',
            communes: ['Farafangana', 'Ambalatany', 'Anosivelo'],
          },
          {
            nom: 'Vangaindrano',
            communes: ['Vangaindrano', 'Amparihy Est', 'Ranomena'],
          },
        ],
      },
      {
        nom: 'Ihorombe',
        chefLieu: 'Ihosy',
        districts: [
          {
            nom: 'Ihosy',
            communes: ['Ihosy', 'Ranohira (Isalo)', 'Sakaraha'],
          },
        ],
      },
    ],
  },
  {
    nom: 'Toliara',
    chefLieu: 'Toliara',
    regions: [
      {
        nom: 'Atsimo-Andrefana',
        chefLieu: 'Toliara (Tuléar)',
        districts: [
          {
            nom: 'Toliara I',
            communes: ['Toliara Centre', 'Besakoa', 'Betania', 'Sanfily'],
          },
          {
            nom: 'Toliara II',
            communes: ['Anakao', 'Ifaty', 'Mangataboahangy', 'Saint-Augustin'],
          },
          {
            nom: 'Morombe',
            communes: ['Morombe', 'Ambiky', 'Befandriana Sud'],
          },
          {
            nom: 'Sakaraha',
            communes: ['Sakaraha', 'Mahaboboka', 'Miary Taheza'],
          },
        ],
      },
      {
        nom: 'Menabe',
        chefLieu: 'Morondava',
        districts: [
          {
            nom: 'Morondava',
            communes: ['Morondava Ville', 'Belo sur Mer', 'Bemanonga'],
          },
          {
            nom: 'Belo sur Tsiribihina',
            communes: ['Belo sur Tsiribihina', 'Berevo', 'Tsaraotana'],
          },
          {
            nom: 'Mahabo',
            communes: ['Mahabo', 'Ankilizato', 'Befotaka'],
          },
        ],
      },
      {
        nom: 'Androy',
        chefLieu: 'Ambovombe',
        districts: [
          {
            nom: 'Ambovombe-Androy',
            communes: ['Ambovombe', 'Ambohimalaza', 'Sihanamaro'],
          },
          {
            nom: 'Bekily',
            communes: ['Bekily', 'Ambahita', 'Beraketa'],
          },
        ],
      },
      {
        nom: 'Anosy',
        chefLieu: 'Taolagnaro (Fort-Dauphin)',
        districts: [
          {
            nom: 'Taolagnaro',
            communes: ['Fort-Dauphin Ville', 'Ampasy Nahampoana', 'Ranomafana Sud', 'Sainte Luce'],
          },
          {
            nom: 'Amboasary Sud',
            communes: ['Amboasary', 'Behara', 'Tranomaro'],
          },
        ],
      },
    ],
  },
]

export function getAllProvinces(): string[] {
  return MADAGASCAR_DIVISIONS.map((p) => p.nom)
}

export function getRegionsForProvince(provinceName: string): RegionInfo[] {
  const prov = MADAGASCAR_DIVISIONS.find((p) => p.nom.toLowerCase() === provinceName.toLowerCase())
  return prov ? prov.regions : []
}

export function getAllRegions(): { region: string; province: string }[] {
  const result: { region: string; province: string }[] = []
  for (const prov of MADAGASCAR_DIVISIONS) {
    for (const reg of prov.regions) {
      result.push({ region: reg.nom, province: prov.nom })
    }
  }
  return result
}

export function getDistrictsForRegion(regionName: string): DistrictInfo[] {
  for (const prov of MADAGASCAR_DIVISIONS) {
    const reg = prov.regions.find((r) => r.nom.toLowerCase() === regionName.toLowerCase())
    if (reg) return reg.districts
  }
  return []
}

export function getCommunesForDistrict(districtName: string): string[] {
  for (const prov of MADAGASCAR_DIVISIONS) {
    for (const reg of prov.regions) {
      const dist = reg.districts.find((d) => d.nom.toLowerCase() === districtName.toLowerCase())
      if (dist) return dist.communes
    }
  }
  return []
}
