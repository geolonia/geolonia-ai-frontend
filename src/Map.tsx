import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    geolonia: any;
  }
}

interface Props {
  className?: string;
  onLoad?: (map: any) => void;
}

const MapComponent = (props: Props) => {
  const { onLoad } = props;
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const map = new window.geolonia.Map({
      container: mapContainer.current,
      style: "geolonia/basic-world",
      lang: 'ja',
      hash: true,
    });
    (window as any)._mainMap = map;

    map.on("load", () => {
      if (onLoad) {
        onLoad(map);
      }
    })
  }, [onLoad]);

  return (
    <>
      <div
        className={props.className}
        ref={mapContainer}
        data-navigation-control="on"
        data-gesture-handling="off"
      ></div>
    </>
  );
}

export default MapComponent;
