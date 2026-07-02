export const defaultCoordinatesByCounty = {
  'Montgomery County': { latitude: 39.052, longitude: -77.123 },
  'Prince George’s County': { latitude: 38.864, longitude: -76.846 },
  'Baltimore City': { latitude: 39.29, longitude: -76.612 },
  'Baltimore County': { latitude: 39.373, longitude: -76.612 },
  'Howard County': { latitude: 39.15, longitude: -76.861 },
  'Anne Arundel County': { latitude: 38.978, longitude: -76.492 },
  'Frederick County': { latitude: 39.414, longitude: -77.41 },
};

export const resolveJurisdiction = ({ jurisdiction, coordinates, manualAddress }) => {
  if (jurisdiction && jurisdiction !== 'Select a county') {
    return jurisdiction;
  }

  const inferredFromAddress = inferCountyFromAddress(manualAddress || '');
  if (inferredFromAddress) {
    return inferredFromAddress;
  }

  if (coordinates) {
    return getCountyFromCoords(coordinates.latitude, coordinates.longitude) || 'Montgomery County';
  }

  return 'Montgomery County';
};

export const getCountyFromCoords = (latitude, longitude) => {
  const normalized = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const matches = {
    '39.052,-77.123': 'Montgomery County',
    '38.864,-76.846': 'Prince George’s County',
    '39.290,-76.612': 'Baltimore City',
    '39.373,-76.612': 'Baltimore County',
    '39.150,-76.861': 'Howard County',
    '38.978,-76.492': 'Anne Arundel County',
    '39.414,-77.410': 'Frederick County',
  };

  return matches[normalized] || null;
};

export const inferCountyFromAddress = (value) => {
  const normalized = value.toLowerCase();
  if (normalized.includes('montgomery')) return 'Montgomery County';
  if (normalized.includes('prince george')) return 'Prince George’s County';
  if (normalized.includes('baltimore city')) return 'Baltimore City';
  if (normalized.includes('baltimore county')) return 'Baltimore County';
  if (normalized.includes('howard')) return 'Howard County';
  if (normalized.includes('anne arundel')) return 'Anne Arundel County';
  if (normalized.includes('frederick')) return 'Frederick County';
  return null;
};
