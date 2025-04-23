interface StateCode {
  name: string;
  code: string;
  tin: string;
  alphaCode: string;
}

const stateCodes: StateCode[] = [
  {
    name: 'Jammu and Kashmir',
    code: '01',
    tin: '01',
    alphaCode: 'JK',
  },
  {
    name: 'Himachal Pradesh',
    code: '02',
    tin: '02',
    alphaCode: 'HP',
  },
  {
    name: 'Punjab',
    code: '03',
    tin: '03',
    alphaCode: 'PB',
  },
  {
    name: 'Chandigarh',
    code: '04',
    tin: '04',
    alphaCode: 'CH',
  },
  {
    name: 'Uttarakhand',
    code: '05',
    tin: '05',
    alphaCode: 'UA',
  },
  {
    name: 'Haryana',
    code: '06',
    tin: '06',
    alphaCode: 'HR',
  },
  {
    name: 'Delhi',
    code: '07',
    tin: '07',
    alphaCode: 'DL',
  },
  {
    name: 'Rajasthan',
    code: '08',
    tin: '08',
    alphaCode: 'RJ',
  },
  {
    name: 'Uttar Pradesh',
    code: '09',
    tin: '09',
    alphaCode: 'UP',
  },
  {
    name: 'Bihar',
    code: '10',
    tin: '10',
    alphaCode: 'BR',
  },
  {
    name: 'Sikkim',
    code: '11',
    tin: '11',
    alphaCode: 'SK',
  },
  {
    name: 'Arunachal Pradesh',
    code: '12',
    tin: '12',
    alphaCode: 'AR',
  },
  {
    name: 'Nagaland',
    code: '13',
    tin: '13',
    alphaCode: 'NL',
  },
  {
    name: 'Manipur',
    code: '14',
    tin: '14',
    alphaCode: 'MN',
  },
  {
    name: 'Mizoram',
    code: '15',
    tin: '15',
    alphaCode: 'MZ',
  },
  {
    name: 'Tripura',
    code: '16',
    tin: '16',
    alphaCode: 'TR',
  },
  {
    name: 'Meghalaya',
    code: '17',
    tin: '17',
    alphaCode: 'ML',
  },
  {
    name: 'Assam',
    code: '18',
    tin: '18',
    alphaCode: 'AS',
  },
  {
    name: 'West Bengal',
    code: '19',
    tin: '19',
    alphaCode: 'WB',
  },
  {
    name: 'Jharkhand',
    code: '20',
    tin: '20',
    alphaCode: 'JH',
  },
  {
    name: 'Odisha',
    code: '21',
    tin: '21',
    alphaCode: 'OR',
  },
  {
    name: 'Chhattisgarh',
    code: '22',
    tin: '22',
    alphaCode: 'CG',
  },
  {
    name: 'Madhya Pradesh',
    code: '23',
    tin: '23',
    alphaCode: 'MP',
  },
  {
    name: 'Gujarat',
    code: '24',
    tin: '24',
    alphaCode: 'GJ',
  },
  {
    name: 'Dadra and Nagar Haveli & Daman and Diu',
    code: '26',
    tin: '26',
    alphaCode: 'DNDD',
  },
  {
    name: 'Maharashtra',
    code: '27',
    tin: '27',
    alphaCode: 'MH',
  },
  {
    name: 'Karnataka',
    code: '29',
    tin: '29',
    alphaCode: 'KA',
  },
  {
    name: 'Goa',
    code: '30',
    tin: '30',
    alphaCode: 'GA',
  },
  {
    name: 'Lakshadweep',
    code: '31',
    tin: '31',
    alphaCode: 'LD',
  },
  {
    name: 'Kerala',
    code: '32',
    tin: '32',
    alphaCode: 'KL',
  },
  {
    name: 'Tamil Nadu',
    code: '33',
    tin: '33',
    alphaCode: 'TN',
  },
  {
    name: 'Puducherry',
    code: '34',
    tin: '34',
    alphaCode: 'PY',
  },
  {
    name: 'Andaman and Nicobar Islands',
    code: '35',
    tin: '35',
    alphaCode: 'AN',
  },
  {
    name: 'Telangana',
    code: '36',
    tin: '36',
    alphaCode: 'TS',
  },
  {
    name: 'Andhra Pradesh',
    code: '37',
    tin: '37',
    alphaCode: 'AP',
  },
  {
    name: 'Ladakh',
    code: '38',
    tin: '38',
    alphaCode: 'LA',
  },
  {
    name: 'Other Territory',
    code: '97',
    tin: '97',
    alphaCode: 'OT',
  },
];

export class StateCodeRepository {
  getAllStates(): StateCode[] {
    return stateCodes;
  }

  getStateByCode(code: string): StateCode | undefined {
    return stateCodes.find((state) => state.code === code);
  }

  getStateByAlphaCode(alphaCode: string): StateCode | undefined {
    return stateCodes.find((state) => state.alphaCode === alphaCode);
  }

  getStateByName(name: string): StateCode | undefined {
    return stateCodes.find(
      (state) => state.name.toLowerCase() === name.toLowerCase(),
    );
  }
}

export type { StateCode };
