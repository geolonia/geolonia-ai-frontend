import { GeoloniaMap } from '@geolonia/embed-react';
import './App.scss';
import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const sessionId = useMemo(() => uuidv4(), []);

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
