
import { Lead, ManpowerStats } from './types';

// Helper to generate dates relative to today
const getDay = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const MOCK_LEADS: Lead[] = [
  { id: '1', clientName: 'Tata Steel (Enterprise)', source: 'LinkedIn', category: 'Enterprise', status: 'Hot', mrcValue: 45000, dateAdded: '2024-02-10', lastContacted: '2024-03-01', nextFollowUp: getDay(-2), owner: 'Gulzar Khan' },
  { id: '2', clientName: 'Reliance Retail', source: 'Referral', category: 'Enterprise', status: 'Warm', mrcValue: 12500, dateAdded: '2024-02-12', lastContacted: '2024-02-28', nextFollowUp: getDay(1), owner: 'Amit Singh' },
  { id: '3', clientName: 'Zomato HQ', source: 'Direct', category: 'Enterprise', status: 'Hot', mrcValue: 8500, dateAdded: '2024-02-15', lastContacted: '2024-03-02', nextFollowUp: getDay(0), owner: 'Gulzar Khan' },
  { id: '4', clientName: 'Blinkit Delivery', source: 'Website', category: 'SME', status: 'Cold', mrcValue: 2800, dateAdded: '2024-02-18', lastContacted: '2024-03-03', nextFollowUp: getDay(5), owner: 'Priya Verma' },
  { id: '5', clientName: 'Adani Green', source: 'LinkedIn', category: 'Enterprise', status: 'Warm', mrcValue: 23200, dateAdded: '2024-02-01', lastContacted: '2024-03-01', nextFollowUp: getDay(-1), owner: 'Amit Singh' },
  { id: '6', clientName: 'Paytm Payments', source: 'Google Ads', category: 'Enterprise', status: 'Closed', mrcValue: 15500, dateAdded: '2024-02-05', lastContacted: '2024-03-04', nextFollowUp: getDay(30), owner: 'Gulzar Khan' },
  { id: '7', clientName: 'Nykaa Beauty', source: 'Direct', category: 'SME', status: 'Hot', mrcValue: 3950, dateAdded: '2024-02-10', lastContacted: '2024-03-02', nextFollowUp: getDay(2), owner: 'Priya Verma' },
  { id: '8', clientName: 'Oyo Rooms', source: 'Website', category: 'SME', status: 'Warm', mrcValue: 4100, dateAdded: '2024-02-15', lastContacted: '2024-03-01', nextFollowUp: getDay(-5), owner: 'Amit Singh' },
];

export const MOCK_MANPOWER: ManpowerStats = {
  total: 210,
  present: 185,
  active: 142,   // Assigned to leads
  available: 43  // Present but unassigned
};

export const DATA_SOURCE_LINK = "https://naviganttech-my.sharepoint.com/:x:/g/personal/gulzar_khan_navigant_in/IQDznRr2YxgmSZwdM0KapXOXAbDvfKnPo7muEY8GNu-VGe8?e=Xd0OR4";
