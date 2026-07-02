import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { defaultCoordinatesByCounty, getCountyFromCoords, inferCountyFromAddress } from './locationUtils';

const issueOptions = [
  'pothole',
  'streetlight issue',
  'road damage',
  'trash or dumping',
  'electrical issue',
  'downed tree',
  'animal issue',
  'accident',
  'other',
];

const categories = [
  { label: 'Pothole', value: 'pothole', icon: '🛣️' },
  { label: 'Streetlight Issue', value: 'streetlight issue', icon: '💡' },
  { label: 'Road Damage', value: 'road damage', icon: '🧱' },
  { label: 'Trash or Dumping', value: 'trash or dumping', icon: '🗑️' },
  { label: 'Electrical Issue', value: 'electrical issue', icon: '⚡' },
  { label: 'Other', value: 'other', icon: '🧾' },
];

const countyOptions = [
  'Montgomery County',
  'Prince George’s County',
  'Baltimore City',
  'Baltimore County',
  'Howard County',
  'Anne Arundel County',
  'Frederick County',
];

const directory = {
  'Montgomery County': {
    pothole: [
      { name: 'Montgomery County 311', phone: '301-279-8000', description: 'County non-emergency service for potholes and municipal issues.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway pothole reports on major roads.', priority: 'secondary' },
    ],
    'streetlight issue': [
      { name: 'Montgomery County 311', phone: '301-279-8000', description: 'Report streetlight outages and damaged fixtures.', priority: 'primary' },
    ],
    'road damage': [
      { name: 'Montgomery County 311', phone: '301-279-8000', description: 'Report unsafe road conditions and pavement damage.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway road damage routing.', priority: 'secondary' },
    ],
    'trash or dumping': [
      { name: 'Montgomery County 311', phone: '301-279-8000', description: 'Illegal dumping and sanitation concerns.', priority: 'primary' },
    ],
    'electrical issue': [
      { name: 'Pepco', phone: '1-877-737-2662', description: 'Electric service outages and power issues.', priority: 'primary' },
      { name: 'Montgomery County 311', phone: '301-279-8000', description: 'Report public area electrical hazards.', priority: 'secondary' },
    ],
    'downed tree': [
      { name: 'Montgomery County 311', phone: '301-279-8000', description: 'Hazardous tree and branch reports.', priority: 'primary' },
    ],
    'animal issue': [
      { name: 'Animal Services Division', phone: '301-279-8000', description: 'Animal control and nuisance wildlife concerns.', priority: 'primary' },
    ],
    accident: [
      { name: 'Emergency Services', phone: '911', description: 'Immediate response for crashes or serious incidents.', priority: 'primary' },
    ],
    other: [
      { name: 'Montgomery County 311', phone: '301-279-8000', description: 'General civic service requests.', priority: 'primary' },
    ],
  },
  'Prince George’s County': {
    pothole: [
      { name: 'Prince George’s County 311', phone: '301-952-3333', description: 'County service line for potholes and roadway concerns.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway pothole reports on major roads.', priority: 'secondary' },
    ],
    'streetlight issue': [
      { name: 'Prince George’s County 311', phone: '301-952-3333', description: 'Streetlight maintenance and outages.', priority: 'primary' },
    ],
    'road damage': [
      { name: 'Prince George’s County 311', phone: '301-952-3333', description: 'Road and pavement damage reporting.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway road damage routing.', priority: 'secondary' },
    ],
    'trash or dumping': [
      { name: 'Prince George’s County 311', phone: '301-952-3333', description: 'Illegal dumping and environmental cleanup.', priority: 'primary' },
    ],
    'electrical issue': [
      { name: 'Pepco', phone: '1-877-737-2662', description: 'Electric power issues for Prince George’s County.', priority: 'primary' },
      { name: 'Prince George’s County 311', phone: '301-952-3333', description: 'Public area electrical hazards.', priority: 'secondary' },
    ],
    'downed tree': [
      { name: 'Prince George’s County 311', phone: '301-952-3333', description: 'Hazardous tree and branch reports.', priority: 'primary' },
    ],
    'animal issue': [
      { name: 'Animal Services', phone: '301-780-7200', description: 'Animal control and shelter services.', priority: 'primary' },
    ],
    accident: [
      { name: 'Emergency Services', phone: '911', description: 'Immediate response for crashes or serious incidents.', priority: 'primary' },
    ],
    other: [
      { name: 'Prince George’s County 311', phone: '301-952-3333', description: 'General civic service requests.', priority: 'primary' },
    ],
  },
  'Baltimore City': {
    pothole: [
      { name: 'Baltimore City 311', phone: '410-396-5358', description: 'Pothole reporting for city roads.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway pothole reports on major roads.', priority: 'secondary' },
    ],
    'streetlight issue': [
      { name: 'Baltimore City 311', phone: '410-396-5358', description: 'Streetlight outages and block lighting issues.', priority: 'primary' },
    ],
    'road damage': [
      { name: 'Baltimore City 311', phone: '410-396-5358', description: 'Road surface and damaged pavement reporting.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway road damage routing.', priority: 'secondary' },
    ],
    'trash or dumping': [
      { name: 'Baltimore City 311', phone: '410-396-5358', description: 'Illegal dumping and sanitation concerns.', priority: 'primary' },
    ],
    'electrical issue': [
      { name: 'Baltimore Gas and Electric', phone: '1-800-685-0123', description: 'Power outages and electrical service issues.', priority: 'primary' },
      { name: 'Baltimore City 311', phone: '410-396-5358', description: 'Public electrical hazards.', priority: 'secondary' },
    ],
    'downed tree': [
      { name: 'Baltimore City 311', phone: '410-396-5358', description: 'Blocked roads and hazardous trees.', priority: 'primary' },
    ],
    'animal issue': [
      { name: 'Animal Control', phone: '410-396-5358', description: 'Animal control and nuisance concerns.', priority: 'primary' },
    ],
    accident: [
      { name: 'Emergency Services', phone: '911', description: 'Immediate response for crashes or serious incidents.', priority: 'primary' },
    ],
    other: [
      { name: 'Baltimore City 311', phone: '410-396-5358', description: 'General civic service requests.', priority: 'primary' },
    ],
  },
  'Baltimore County': {
    pothole: [
      { name: 'Baltimore County 311', phone: '410-887-6789', description: 'Pothole and road maintenance concerns.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway pothole reports on major roads.', priority: 'secondary' },
    ],
    'streetlight issue': [
      { name: 'Baltimore County 311', phone: '410-887-6789', description: 'Streetlight outages and maintenance.', priority: 'primary' },
    ],
    'road damage': [
      { name: 'Baltimore County 311', phone: '410-887-6789', description: 'Pavement and roadway damage reporting.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway road damage routing.', priority: 'secondary' },
    ],
    'trash or dumping': [
      { name: 'Baltimore County 311', phone: '410-887-6789', description: 'Illegal dumping and sanitation requests.', priority: 'primary' },
    ],
    'electrical issue': [
      { name: 'Baltimore Gas and Electric', phone: '1-800-685-0123', description: 'Electric service and outage reporting.', priority: 'primary' },
      { name: 'Baltimore County 311', phone: '410-887-6789', description: 'Public hazard electrical concerns.', priority: 'secondary' },
    ],
    'downed tree': [
      { name: 'Baltimore County 311', phone: '410-887-6789', description: 'Hazardous trees and debris reports.', priority: 'primary' },
    ],
    'animal issue': [
      { name: 'Animal Control', phone: '410-887-6789', description: 'Animal control requests.', priority: 'primary' },
    ],
    accident: [
      { name: 'Emergency Services', phone: '911', description: 'Immediate response for crashes or serious incidents.', priority: 'primary' },
    ],
    other: [
      { name: 'Baltimore County 311', phone: '410-887-6789', description: 'General civic service requests.', priority: 'primary' },
    ],
  },
  'Howard County': {
    pothole: [
      { name: 'Howard County 311', phone: '410-313-4200', description: 'Road maintenance and pothole reporting.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway pothole reports on major roads.', priority: 'secondary' },
    ],
    'streetlight issue': [
      { name: 'Howard County 311', phone: '410-313-4200', description: 'Public streetlight issues.', priority: 'primary' },
    ],
    'road damage': [
      { name: 'Howard County 311', phone: '410-313-4200', description: 'Road damage and pavement concerns.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway road damage routing.', priority: 'secondary' },
    ],
    'trash or dumping': [
      { name: 'Howard County 311', phone: '410-313-4200', description: 'Illegal dumping and sanitation concerns.', priority: 'primary' },
    ],
    'electrical issue': [
      { name: 'BGE', phone: '1-800-685-0123', description: 'Electrical utility reporting.', priority: 'primary' },
      { name: 'Howard County 311', phone: '410-313-4200', description: 'Public electrical hazards.', priority: 'secondary' },
    ],
    'downed tree': [
      { name: 'Howard County 311', phone: '410-313-4200', description: 'Hazardous tree and branch reports.', priority: 'primary' },
    ],
    'animal issue': [
      { name: 'Animal Control', phone: '410-313-4200', description: 'Animal service and control requests.', priority: 'primary' },
    ],
    accident: [
      { name: 'Emergency Services', phone: '911', description: 'Immediate response for crashes or serious incidents.', priority: 'primary' },
    ],
    other: [
      { name: 'Howard County 311', phone: '410-313-4200', description: 'General civic service requests.', priority: 'primary' },
    ],
  },
  'Anne Arundel County': {
    pothole: [
      { name: 'Anne Arundel County 311', phone: '410-222-7950', description: 'Pothole and street repair reporting.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway pothole reports on major roads.', priority: 'secondary' },
    ],
    'streetlight issue': [
      { name: 'Anne Arundel County 311', phone: '410-222-7950', description: 'Streetlight outage and fixture concerns.', priority: 'primary' },
    ],
    'road damage': [
      { name: 'Anne Arundel County 311', phone: '410-222-7950', description: 'Road damage and pavement concerns.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway road damage routing.', priority: 'secondary' },
    ],
    'trash or dumping': [
      { name: 'Anne Arundel County 311', phone: '410-222-7950', description: 'Illegal dumping and sanitation concerns.', priority: 'primary' },
    ],
    'electrical issue': [
      { name: 'BGE', phone: '1-800-685-0123', description: 'Electrical utility service reporting.', priority: 'primary' },
      { name: 'Anne Arundel County 311', phone: '410-222-7950', description: 'Public electrical hazard reporting.', priority: 'secondary' },
    ],
    'downed tree': [
      { name: 'Anne Arundel County 311', phone: '410-222-7950', description: 'Hazardous tree and branch reports.', priority: 'primary' },
    ],
    'animal issue': [
      { name: 'Animal Control', phone: '410-222-7950', description: 'Animal control and nuisance concerns.', priority: 'primary' },
    ],
    accident: [
      { name: 'Emergency Services', phone: '911', description: 'Immediate response for crashes or serious incidents.', priority: 'primary' },
    ],
    other: [
      { name: 'Anne Arundel County 311', phone: '410-222-7950', description: 'General civic service requests.', priority: 'primary' },
    ],
  },
  'Frederick County': {
    pothole: [
      { name: 'Frederick County 311', phone: '301-600-1100', description: 'Pothole and street maintenance reporting.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway pothole reports on major roads.', priority: 'secondary' },
    ],
    'streetlight issue': [
      { name: 'Frederick County 311', phone: '301-600-1100', description: 'Streetlight outage and maintenance concerns.', priority: 'primary' },
    ],
    'road damage': [
      { name: 'Frederick County 311', phone: '301-600-1100', description: 'Road damage and pavement concerns.', priority: 'primary' },
      { name: 'MDOT SHA', phone: '1-800-543-2515', description: 'State highway road damage routing.', priority: 'secondary' },
    ],
    'trash or dumping': [
      { name: 'Frederick County 311', phone: '301-600-1100', description: 'Illegal dumping and sanitation concerns.', priority: 'primary' },
    ],
    'electrical issue': [
      { name: 'Potomac Edison', phone: '1-800-686-0023', description: 'Electric service and outage reporting.', priority: 'primary' },
      { name: 'Frederick County 311', phone: '301-600-1100', description: 'Public electrical hazard reporting.', priority: 'secondary' },
    ],
    'downed tree': [
      { name: 'Frederick County 311', phone: '301-600-1100', description: 'Hazardous tree and branch reports.', priority: 'primary' },
    ],
    'animal issue': [
      { name: 'Animal Control', phone: '301-600-1100', description: 'Animal control and nuisance concerns.', priority: 'primary' },
    ],
    accident: [
      { name: 'Emergency Services', phone: '911', description: 'Immediate response for crashes or serious incidents.', priority: 'primary' },
    ],
    other: [
      { name: 'Frederick County 311', phone: '301-600-1100', description: 'General civic service requests.', priority: 'primary' },
    ],
  },
};

const isEmergencyIssue = (issueType) => issueType === 'accident';

const getInitials = (email) => (email ? email.charAt(0).toUpperCase() : 'U');

const EmailGate = ({ email, setEmail, onContinue }) => {
  const [error, setError] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = email.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!validEmail) {
      setError('Please enter a valid email address to continue.');
      return;
    }
    onContinue(trimmed);
  };

  return (
    <div className="min-h-screen bg-pageBg px-4 py-8 text-slateText flex items-center justify-center">
      <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-card">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic">Maryland Civic Support</p>
          <h1 className="mt-2 text-[28px] font-bold text-slateText">FixPoint Maryland</h1>
          <p className="mt-3 text-[15px] leading-6 text-mutedText">Enter your email to access verified local contacts for civic issues.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-slateText" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError('');
            }}
            placeholder="you@example.com"
            className="w-full rounded-[12px] border border-slate-200 px-4 py-3 text-[15px] outline-none ring-0 focus:border-civic"
            autoComplete="email"
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button type="submit" className="w-full rounded-[12px] bg-civic px-4 py-3 text-[16px] font-semibold text-white">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

const HomeScreen = ({ email, onStartReport }) => {
  return (
    <div className="min-h-screen bg-pageBg px-4 py-6 text-slateText">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="rounded-[16px] bg-white p-6 shadow-card text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic">Welcome back</p>
          <h1 className="mt-2 text-[28px] font-bold text-slateText">FixPoint Maryland</h1>
          <p className="mt-3 text-[15px] leading-6 text-mutedText">Find the right official contact for any local issue in seconds.</p>
          <button onClick={onStartReport} className="mt-6 w-full rounded-[12px] bg-civic px-4 py-3 text-[16px] font-semibold text-white md:max-w-xs">
            Report an Issue
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => onStartReport(category.value)}
              className="rounded-[16px] border border-slate-200 bg-white p-4 text-left shadow-card"
            >
              <div className="text-[22px]">{category.icon}</div>
              <div className="mt-3 text-[15px] font-semibold text-slateText">{category.label}</div>
            </button>
          ))}
        </div>
        <div className="rounded-[16px] bg-white p-4 shadow-card text-sm text-mutedText">
          Signed in as <span className="font-semibold text-slateText">{email}</span>
        </div>
      </div>
    </div>
  );
};

const ReportForm = ({ onSubmit, initialIssueType = 'pothole' }) => {
  const [issueType, setIssueType] = useState(initialIssueType);
  const [description, setDescription] = useState('');
  const [locationMethod, setLocationMethod] = useState('manual');
  const [manualAddress, setManualAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ latitude: 39.29, longitude: -76.61 });
  const [jurisdiction, setJurisdiction] = useState('Select a county');
  const [contextImage, setContextImage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const jurisdictionRef = useRef(jurisdiction);

  useEffect(() => {
    jurisdictionRef.current = jurisdiction;
  }, [jurisdiction]);

  const handleLocationLookup = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not available on this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const detectedJurisdiction = getCountyFromCoords(nextCoordinates.latitude, nextCoordinates.longitude);
        setCoordinates(nextCoordinates);
        if (detectedJurisdiction) {
          setJurisdiction(detectedJurisdiction);
          jurisdictionRef.current = detectedJurisdiction;
          setLocationMethod('geo');
          setStatusMessage(`Location detected in ${detectedJurisdiction}.`);
        } else {
          setJurisdiction('Select a county');
          jurisdictionRef.current = 'Select a county';
          setLocationMethod('geo');
          setStatusMessage('We could not identify your county from this location. Please choose one manually.');
        }
      },
      () => {
        setStatusMessage('Location access was denied. You can still enter a manual address.');
      }
    );
  };

  const handleManualAddressChange = (event) => {
    const nextValue = event.target.value;
    setManualAddress(nextValue);
    setLocationMethod('manual');

    const inferredCounty = inferCountyFromAddress(nextValue);
    if (inferredCounty) {
      setJurisdiction(inferredCounty);
      jurisdictionRef.current = inferredCounty;
      setCoordinates(defaultCoordinatesByCounty[inferredCounty]);
      setStatusMessage(`Address saved for ${inferredCounty}.`);
      return;
    }

    if (nextValue.trim()) {
      setJurisdiction('Select a county');
      jurisdictionRef.current = 'Select a county';
      setStatusMessage('Address saved. Please choose a county to refine routing.');
    } else {
      setJurisdiction('Select a county');
      jurisdictionRef.current = 'Select a county';
      setStatusMessage('');
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setContextImage(result);
      localStorage.setItem('fixpoint-context-image', result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const storedImage = localStorage.getItem('fixpoint-context-image');
    if (storedImage) {
      setContextImage(storedImage);
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    const resolvedJurisdiction = resolveJurisdiction({
      jurisdiction: jurisdictionRef.current,
      coordinates,
      manualAddress,
    });

    if (!resolvedJurisdiction || resolvedJurisdiction === 'Select a county') {
      setStatusMessage('Please choose a county before finding contacts.');
      return;
    }

    const nextCoordinates =
      resolvedJurisdiction && defaultCoordinatesByCounty[resolvedJurisdiction]
        ? defaultCoordinatesByCounty[resolvedJurisdiction]
        : coordinates;

    const nextReport = {
      issueType,
      description,
      locationMethod,
      manualAddress,
      coordinates: nextCoordinates,
      jurisdiction: resolvedJurisdiction,
      contextImage,
      timestamp: new Date().toISOString(),
    };
    onSubmit(nextReport);
  };

  return (
    <div className="min-h-screen bg-pageBg px-4 py-6 text-slateText">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div className="rounded-[16px] bg-white p-6 shadow-card">
          <h2 className="text-[22px] font-bold text-slateText">Report an Issue</h2>
          <p className="mt-2 text-[15px] leading-6 text-mutedText">Choose the issue type and provide your location so we can route you to the right official contact.</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-[16px] bg-white p-6 shadow-card space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slateText">Issue type</label>
            <select value={issueType} onChange={(event) => setIssueType(event.target.value)} className="w-full rounded-[12px] border border-slate-200 px-4 py-3 text-[15px]">
              {issueOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slateText">Description (optional)</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full rounded-[12px] border border-slate-200 px-4 py-3 text-[15px]" placeholder="Add a brief explanation for the dispatcher." />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slateText">Location</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleLocationLookup} className="rounded-[12px] border border-civic px-4 py-3 text-[15px] font-semibold text-civic">Use my location</button>
              <button type="button" onClick={() => setLocationMethod('manual')} className="rounded-[12px] border border-slate-300 px-4 py-3 text-[15px] font-semibold text-slateText">Manual address</button>
            </div>
            {locationMethod === 'manual' ? (
              <input value={manualAddress} onChange={handleManualAddressChange} placeholder="Enter a street address or landmark" className="mt-3 w-full rounded-[12px] border border-slate-200 px-4 py-3 text-[15px]" />
            ) : null}
            <div className="mt-3 rounded-[12px] border border-slate-200 bg-slate-50 p-3 text-sm text-mutedText">
              <div>Selected county: <span className="font-semibold text-slateText">{jurisdiction}</span></div>
              <div>
                Coordinates: {coordinates.latitude.toFixed(3)}, {coordinates.longitude.toFixed(3)}
              </div>
            </div>
            {statusMessage ? <p className="mt-2 text-sm text-civic">{statusMessage}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slateText">County (if needed)</label>
            <select
              value={jurisdiction}
              onChange={(event) => {
                const nextCounty = event.target.value;
                setJurisdiction(nextCounty);
                jurisdictionRef.current = nextCounty;
                if (defaultCoordinatesByCounty[nextCounty]) {
                  setCoordinates(defaultCoordinatesByCounty[nextCounty]);
                }
              }}
              className="w-full rounded-[12px] border border-slate-200 px-4 py-3 text-[15px]"
            >
              <option value="Select a county">Select a county</option>
              {countyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slateText">Context image (optional, saved only on this device)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full rounded-[12px] border border-slate-200 px-4 py-3 text-[15px]" />
            {contextImage ? <img src={contextImage} alt="Context preview" className="mt-3 h-32 w-full rounded-[12px] object-cover" /> : null}
          </div>
          <button type="submit" className="w-full rounded-[12px] bg-civic px-4 py-3 text-[16px] font-semibold text-white">
            Find Contacts
          </button>
        </form>
      </div>
    </div>
  );
};

const ResultsScreen = ({ report, onBack }) => {
  const [copiedNumber, setCopiedNumber] = useState('');
  const jurisdiction = report?.jurisdiction || 'Montgomery County';
  const issueType = report?.issueType || 'pothole';
  const contacts = useMemo(() => {
    const options = directory[jurisdiction]?.[issueType] || [];
    return [...options].sort((left, right) => {
      const order = { primary: 0, secondary: 1, fallback: 2 };
      return order[left.priority] - order[right.priority];
    });
  }, [issueType, jurisdiction]);

  const handleCopy = async (number) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedNumber(number);
    } catch {
      setCopiedNumber(number);
    }
  };

  if (isEmergencyIssue(issueType)) {
    return (
      <div className="min-h-screen bg-danger px-4 py-6 text-white flex items-center justify-center">
        <div className="w-full max-w-xl rounded-[16px] bg-white p-8 text-center shadow-card">
          <h2 className="text-[28px] font-bold text-danger">Call 911 immediately</h2>
          <p className="mt-4 text-[16px] leading-7 text-mutedText">This situation requires urgent emergency assistance. Please call 911 now and follow local emergency guidance.</p>
          <a href="tel:911" className="mt-6 inline-flex w-full items-center justify-center rounded-[12px] bg-danger px-4 py-3 text-[16px] font-semibold text-white">Call 911</a>
          <button onClick={onBack} className="mt-3 w-full rounded-[12px] border border-slate-300 px-4 py-3 text-[15px] font-semibold text-slateText">Back to report</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pageBg px-4 py-6 text-slateText">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="rounded-[16px] bg-white p-6 shadow-card">
          <h2 className="text-[22px] font-bold text-slateText">Contact Options for Your Issue</h2>
          <p className="mt-2 text-[15px] leading-6 text-mutedText">Detected jurisdiction: {jurisdiction}. Issue type: {issueType}.</p>
        </div>
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div key={`${contact.name}-${contact.phone}`} className="rounded-[16px] bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[16px] font-semibold text-slateText">{contact.name}</h3>
                  <p className="mt-1 text-[15px] leading-6 text-mutedText">{contact.description}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-civic">{contact.priority}</span>
              </div>
              <div className="mt-4 text-[22px] font-bold text-slateText">{contact.phone}</div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <a href={`tel:${contact.phone}`} className="flex-1 rounded-[12px] bg-success px-4 py-3 text-center text-[15px] font-semibold text-white">Call Now</a>
                <button onClick={() => handleCopy(contact.phone)} className="flex-1 rounded-[12px] border border-slate-300 px-4 py-3 text-[15px] font-semibold text-slateText">
                  {copiedNumber === contact.phone ? 'Copied' : 'Copy Number'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onBack} className="rounded-[12px] border border-civic px-4 py-3 text-[15px] font-semibold text-civic">Back to report</button>
      </div>
    </div>
  );
};

const MyReportsScreen = ({ reports, setReports }) => {
  const [expandedId, setExpandedId] = useState(null);

  const removeReport = (id) => {
    const nextReports = reports.filter((report) => report.id !== id);
    setReports(nextReports);
    localStorage.setItem('fixpoint-reports', JSON.stringify(nextReports));
  };

  return (
    <div className="min-h-screen bg-pageBg px-4 py-6 text-slateText">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="rounded-[16px] bg-white p-6 shadow-card">
          <h2 className="text-[22px] font-bold text-slateText">My Reports</h2>
          <p className="mt-2 text-[15px] leading-6 text-mutedText">Your saved reports stay on this device and can be reviewed anytime.</p>
        </div>
        {reports.length === 0 ? (
          <div className="rounded-[16px] bg-white p-6 text-center shadow-card text-mutedText">No reports yet.</div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="rounded-[16px] bg-white p-4 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[16px] font-semibold text-slateText">{report.issueType}</div>
                  <div className="text-sm text-mutedText">{report.jurisdiction} • {new Date(report.timestamp).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setExpandedId((current) => (current === report.id ? null : report.id))} className="rounded-[12px] border border-civic px-3 py-2 text-sm font-semibold text-civic">{expandedId === report.id ? 'Hide' : 'View'}</button>
                  <button onClick={() => removeReport(report.id)} className="rounded-[12px] border border-danger px-3 py-2 text-sm font-semibold text-danger">Remove</button>
                </div>
              </div>
              {expandedId === report.id ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-[12px] bg-slate-50 p-3 text-sm text-mutedText">{report.description || 'No description provided.'}</div>
                  <div className="space-y-2">
                    {report.contactList.map((contact) => (
                      <div key={`${contact.name}-${contact.phone}`} className="rounded-[12px] border border-slate-200 p-3">
                        <div className="font-semibold text-slateText">{contact.name}</div>
                        <div className="text-sm text-mutedText">{contact.phone}</div>
                      </div>
                    ))}
                  </div>
                  {report.contextImage ? <img src={report.contextImage} alt="Saved context" className="h-32 w-full rounded-[12px] object-cover" /> : null}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const MapScreen = ({ reports }) => {
  const defaultCenter = [39.29, -76.61];
  const customIcon = new Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="min-h-screen bg-pageBg px-4 py-6 text-slateText">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="rounded-[16px] bg-white p-6 shadow-card">
          <h2 className="text-[22px] font-bold text-slateText">Map of Reported Issues</h2>
          <p className="mt-2 text-[15px] leading-6 text-mutedText">Local reports are shown here for reference, and markers include the recommended contacts.</p>
        </div>
        <div className="overflow-hidden rounded-[16px] bg-white p-2 shadow-card">
          <MapContainer center={defaultCenter} zoom={7} style={{ height: '420px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {reports.map((report) => (
              <Marker key={report.id} position={[report.coordinates.latitude, report.coordinates.longitude]} icon={customIcon}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{report.issueType}</div>
                    <div className="mt-1 text-mutedText">{report.jurisdiction}</div>
                    <ul className="mt-2 space-y-1">
                      {report.contactList.map((contact) => (
                        <li key={`${contact.name}-${contact.phone}`}>
                          <span className="font-semibold">{contact.name}:</span> {contact.phone}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [email, setEmail] = useState('');
  const [hasEmail, setHasEmail] = useState(() => Boolean(localStorage.getItem('fixpoint-email')));
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedIssueType, setSelectedIssueType] = useState('pothole');
  const [reportDraft, setReportDraft] = useState(null);
  const [reports, setReports] = useState(() => {
    const storedReports = localStorage.getItem('fixpoint-reports');
    if (!storedReports) return [];
    try {
      return JSON.parse(storedReports);
    } catch {
      return [];
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('fixpoint-email');
    if (storedEmail) {
      setEmail(storedEmail);
      setHasEmail(true);
    }
  }, []);

  const saveReport = (nextReport) => {
    const contactList = directory[nextReport.jurisdiction]?.[nextReport.issueType] || [];
    const savedReport = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...nextReport,
      contactList,
    };
    const nextReports = [savedReport, ...reports];
    setReports(nextReports);
    localStorage.setItem('fixpoint-reports', JSON.stringify(nextReports));
    setReportDraft(savedReport);
    setCurrentScreen('results');
    navigate('/results');
  };

  const handleContinue = (nextEmail) => {
    localStorage.setItem('fixpoint-email', nextEmail);
    setEmail(nextEmail);
    setHasEmail(true);
    setCurrentScreen('home');
    navigate('/');
  };

  const handleStartReport = (issueType = 'pothole') => {
    setSelectedIssueType(issueType);
    setCurrentScreen('report');
    navigate('/report');
  };

  const handleBack = () => {
    setCurrentScreen('report');
    navigate('/report');
  };

  return (
    <div className="min-h-screen bg-pageBg">
      <nav className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          <Link to="/" className="text-[16px] font-semibold text-civic">FixPoint Maryland</Link>
          <div className="flex gap-2 text-sm font-semibold text-slateText">
            <Link to="/" className="rounded-[12px] px-3 py-2 hover:bg-slate-50">Home</Link>
            <Link to="/report" className="rounded-[12px] px-3 py-2 hover:bg-slate-50">Report</Link>
            <Link to="/reports" className="rounded-[12px] px-3 py-2 hover:bg-slate-50">My Reports</Link>
            <Link to="/map" className="rounded-[12px] px-3 py-2 hover:bg-slate-50">Map</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={hasEmail ? <HomeScreen email={email} onStartReport={handleStartReport} /> : <Navigate to="/email" replace />} />
        <Route path="/email" element={<EmailGate email={email} setEmail={setEmail} onContinue={handleContinue} />} />
        <Route path="/report" element={<ReportForm initialIssueType={selectedIssueType} onSubmit={saveReport} />} />
        <Route path="/results" element={<ResultsScreen report={reportDraft} onBack={handleBack} />} />
        <Route path="/reports" element={<MyReportsScreen reports={reports} setReports={setReports} />} />
        <Route path="/map" element={<MapScreen reports={reports} />} />
      </Routes>
    </div>
  );
}

export default App;
