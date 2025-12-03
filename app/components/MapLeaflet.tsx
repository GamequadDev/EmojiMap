import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapMarker, EmojiType, User, Visibility } from '../types';
import { DEFAULT_CENTER } from '../constants';
import { Trash2, Edit2, Lock, Link as LinkIcon, Globe, Share2, Plus, Tag } from 'lucide-react';
import { resolveEmoji } from '../utils';

// Function to create a custom divIcon for Emojis
const createEmojiIcon = (emoji: string) => {
  // We use L.divIcon to render HTML as a marker
  // Note: Typescript might complain about L if not imported, but we use type import or ignore for simplicity in this setup
  // Since we are dynamically importing leaflet or assuming global L in script tag, we construct a config object

  // However, react-leaflet uses the leaflet instance internally.
  // To make this robust without complex build step, we'll cast to any for the `L` global if needed,
  // but standard practice is importing `divIcon`.
  // We need to import leaflet css in index.html which we did.
};



// Subcomponent to handle map clicks
const LocationMarker = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Subcomponent to control map view programmatically
const MapController = ({ center, zoom }: { center?: { lat: number, lng: number }, zoom?: number }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], zoom || map.getZoom(), {
        duration: 1.5
      });
    }
  }, [center, zoom, map]);

  return null;
};

interface MapLeafletProps {
  markers: MapMarker[];
  currentUser: User | null;
  onAddMarkerRequest: (lat: number, lng: number) => void;
  onEditMarker: (marker: MapMarker) => void;
  onDeleteMarker: (markerId: string) => void;
  onShareMarker: (markerId: string) => void;
  tempMarkerPosition?: { lat: number, lng: number } | null;
  onConfirmLocation?: () => void;
  center?: { lat: number, lng: number };
  zoom?: number;
}

const MapLeaflet: React.FC<MapLeafletProps> = ({
  markers,
  currentUser,
  onAddMarkerRequest,
  onEditMarker,
  onDeleteMarker,
  onShareMarker,
  tempMarkerPosition,
  onConfirmLocation,
  center,
  zoom
}) => {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Leaflet on client side to avoid SSR issues (if this were Next.js)
    // and ensure it's available.
    import('leaflet').then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (!L) return <div className="w-full h-full flex items-center justify-center bg-slate-100">Ładowanie mapy...</div>;

  return (
    <MapContainer
      center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
      zoom={DEFAULT_CENTER.zoom}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker onMapClick={onAddMarkerRequest} />
      <MapController center={center} zoom={zoom} />

      {/* Temporary Draft Marker */}
      {tempMarkerPosition && (
        <Marker
          position={[tempMarkerPosition.lat, tempMarkerPosition.lng]}
          icon={L.divIcon({
            className: 'temp-marker-icon',
            html: `<div style="background: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; animation: bounce 0.5s infinite alternate;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })}
        >
          <Popup
            closeButton={false}
            className="temp-marker-popup"
            minWidth={120}
            offset={[0, -10]}
          >
            <div className="flex flex-col items-center p-1 gap-2">
              <p className="font-bold text-slate-700 text-sm">Nowy punkt?</p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  onConfirmLocation?.();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-1"
              >
                <Plus size={12} />
                Dodaj tutaj
              </button>
            </div>
          </Popup>
        </Marker>
      )}

      {markers.map((marker) => {
        const displayEmoji = resolveEmoji(marker.emoji);
        const customIcon = L.divIcon({
          className: 'custom-emoji-marker',
          html: `<div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: transform 0.2s;">${displayEmoji}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15]
        });

        const isOwner = currentUser && currentUser.id === marker.userId;

        return (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={customIcon}
          >
            <Popup className="rounded-lg overflow-hidden shadow-xl border-none">
              <div className="min-w-[200px]">
                <div className="bg-slate-50 p-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="text-2xl">{displayEmoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 leading-tight">{marker.title}</h3>
                    {marker.visibility !== Visibility.PUBLIC && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        {marker.visibility === Visibility.PRIVATE ? <Lock size={10} /> : <LinkIcon size={10} />}
                        <span>{marker.visibility === Visibility.PRIVATE ? 'Prywatny' : 'Niepubliczny'}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-slate-600 text-sm">{marker.description}</p>

                  {/* Tags in Popup */}
                  {marker.tags && marker.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {marker.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-2 text-right">
                    Dodano: {new Date(marker.createdAt).toLocaleDateString()}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end gap-2">
                    {marker.visibility !== Visibility.PRIVATE && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                          onShareMarker(marker.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Udostępnij link"
                      >
                        <Share2 size={14} />
                      </button>
                    )}

                    {isOwner && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            onEditMarker(marker);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edytuj"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            onDeleteMarker(marker.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Usuń"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapLeaflet;