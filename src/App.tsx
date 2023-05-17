import Map from './Map'
import './App.scss';

function App() {
  return (
    <div className="App">
      <div className="map-contaienr"><Map className='map'></Map></div>
      <div className="chat-container">
        <div className="chat-inner-container">
          <div className="messages">
            <div className="message request">香川県高松市を表示してください。</div>
            <div className="message response">かしこまりました。高松市を表示します。</div>
          </div>
          <div className="form"><input type="text" placeholder="何でも聞いてください..." /></div>
        </div>
      </div>
    </div>
  );
}

export default App;
