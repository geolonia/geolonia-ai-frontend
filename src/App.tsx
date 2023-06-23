import type geolonia from '@geolonia/embed';
import { GeoloniaMap } from '@geolonia/embed-react';
import './App.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function executeInstructions(map: geolonia.Map, instructions: any[]) {
  for (const i of instructions) {
    if (i.action === "mapCmd") {
      //@ts-ignore
      map[i.cmd](...i.argv);
    }
  }
}

const App: React.FC = () => {
  const mapRef = useRef<geolonia.Map | null>(null);
  const sessionId = useMemo(() => uuidv4(), []);
  const [ wsReconnect, setWsReconnect ] = useState(0);

  useEffect(() => {
    let disconnecting = false;

    // connect to the websocket
    const ws = new WebSocket(`wss://e4l6ubznlg.execute-api.ap-northeast-1.amazonaws.com/dev?session_id=${sessionId}`);
    ws.addEventListener('open', () => {
      console.log('connected');
    });
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      const instructions = data.instructions;
      if (!mapRef.current) {
        return;
      }
      executeInstructions(mapRef.current, instructions);
    });
    ws.addEventListener('close', () => {
      console.log('disconnected');
      if (!disconnecting) {
        // we were disconnected because
        // of some error. try to reconnect.
        console.warn('Disconnected. Reconnecting...');
        setWsReconnect(wsReconnect + 1);
      }
    });

    return () => {
      disconnecting = true;
      ws.close();
    }
  }, [sessionId, wsReconnect]);

  return (
    <div className="App">
      <div className="map-container">
        <GeoloniaMap
          apiKey='YOUR-API-KEY'
          className='main-map'
          mapStyle='geolonia/basic-v1'
          hash='on'
          lat='36.91'
          lng='137.9'
          zoom='4'
          marker='off'
          lang='ja'
          mapRef={mapRef}
        />
      </div>
      <df-messenger
        df-cx="true"
        location="asia-northeast1"
        chat-title="Geolonia Maps AI"
        agent-id="4f9097c5-2941-4b93-a1be-75e07c23ebdb"
        session-id={sessionId}
        language-code="ja"
        expand
      ></df-messenger>
    </div>
  );
}

export default App;
