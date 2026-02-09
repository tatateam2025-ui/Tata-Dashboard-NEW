import { Lead, ManpowerStats } from './types';

export const MOCK_LEADS: Lead[] = [
  { id: '1', clientName: 'Aero Dynamics', source: 'LinkedIn', category: 'Enterprise', status: 'Hot', mrcValue: 15200, dateAdded: '2024-01-10', lastContacted: '2024-03-01' },
  { id: '2', clientName: 'Global Tech', source: 'Referral', category: 'SME', status: 'Warm', mrcValue: 4200, dateAdded: '2024-01-12', lastContacted: '2024-02-28' },
  { id: '3', clientName: 'Innovate Corp', source: 'Direct', category: 'Enterprise', status: 'Cold', mrcValue: 8500, dateAdded: '2024-01-15', lastContacted: '2024-03-02' },
  { id: '4', clientName: 'Startup Hub', source: 'Website', category: 'Startup', status: 'Hot', mrcValue: 2800, dateAdded: '2024-01-18', lastContacted: '2024-03-03' },
  { id: '5', clientName: 'Mainstream Solutions', source: 'LinkedIn', category: 'Enterprise', status: 'Warm', mrcValue: 13200, dateAdded: '2024-02-01', lastContacted: '2024-03-01' },
  { id: '6', clientName: 'Vertex Systems', source: 'Google Ads', category: 'SME', status: 'Closed', mrcValue: 5500, dateAdded: '2024-02-05', lastContacted: '2024-03-04' },
  { id: '7', clientName: 'Zenith Labs', source: 'Direct', category: 'Startup', status: 'Hot', mrcValue: 3950, dateAdded: '2024-02-10', lastContacted: '2024-03-02' },
  { id: '8', clientName: 'Apex Retail', source: 'Website', category: 'SME', status: 'Warm', mrcValue: 4100, dateAdded: '2024-02-15', lastContacted: '2024-03-01' },
  { id: '9', clientName: 'Quantum Power', source: 'Referral', category: 'Enterprise', status: 'Hot', mrcValue: 27500, dateAdded: '2024-02-20', lastContacted: '2024-03-04' },
  { id: '10', clientName: 'Cloud Nine', source: 'LinkedIn', category: 'Startup', status: 'Lost', mrcValue: 1600, dateAdded: '2024-02-25', lastContacted: '2024-03-02' },
  { id: '11', clientName: 'Titan Logistix', source: 'Direct', category: 'Enterprise', status: 'Closed', mrcValue: 19500, dateAdded: '2024-02-28', lastContacted: '2024-03-05' },
];

export const MOCK_MANPOWER: ManpowerStats = {
  total: 185,
  active: 162,
  present: 154,
  onLeave: 12
};

export const DATA_SOURCE_LINK = "https://naviganttech-my.sharepoint.com/:x:/g/personal/gulzar_khan_navigant_in/IQDznRr2YxgmSZwdM0KapXOXAbDvfKnPo7muEY8GNu-VGe8?e=Xd0OR4";