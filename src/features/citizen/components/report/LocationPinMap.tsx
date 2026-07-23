import Map, { Marker } from 'react-map-gl/maplibre'
import { useGreenerMapStyle } from '../../lib/map-style'
import { useLanguage } from '@/lib/i18n/language-context'

interface Props {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}

export function LocationPinMap({ lat, lng, onChange }: Props) {
  const mapStyle = useGreenerMapStyle()
  const { t } = useLanguage()

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-xl">
      <Map
        mapStyle={mapStyle}
        initialViewState={{ latitude: lat, longitude: lng, zoom: 15 }}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        onClick={(e) => onChange(e.lngLat.lat, e.lngLat.lng)}
      >
        <Marker
          latitude={lat}
          longitude={lng}
          anchor="bottom"
          draggable
          onDragEnd={(e) => onChange(e.lngLat.lat, e.lngLat.lng)}
        >
          <svg width="26" height="34" viewBox="0 0 28 36" fill="none" className="drop-shadow">
            <path
              d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z"
              fill="#FB7A34"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle cx="14" cy="14" r="5" fill="white" />
          </svg>
        </Marker>
      </Map>
      <p className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white">
        {t('location.dragHint')}
      </p>
    </div>
  )
}
