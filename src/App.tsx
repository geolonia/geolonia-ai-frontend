import Map from './Map'
import './App.scss';
import { useCallback, useState } from 'react';
import { Message } from './types';

const SingleMessage: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`message ${message.type}`}>
      {message.text}
    </div>
  )
};

const ChatInputForm: React.FC<{ onSubmit: (text: string) => void }> = ({ onSubmit }) => {
  const _onSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>((e) => {
    e.preventDefault();
    const text = e.currentTarget.chatText.value.trim();
    if (!text) return;

    e.currentTarget.chatText.value = '';
    onSubmit(text);
  }, [onSubmit]);

  return <form onSubmit={_onSubmit} className="form">
    <input name="chatText" type="text" placeholder="何でも聞いてください..." />
  </form>;
};

const App: React.FC = () => {
  const [ messages, setMessages ] = useState<Message[]>([]);

  const onSubmit = useCallback((text: string) => {
    setMessages((prev) => [...prev, { type: 'request', text }]);
  }, []);

  return (
    <div className="App">
      <div className="map-contaienr"><Map className='map'></Map></div>
      <div className="chat-container">
        <div className="chat-inner-container">
          <div className="messages">
            { messages.map((message, index) => <SingleMessage key={index} message={message} />) }
          </div>
          <ChatInputForm onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
}

export default App;
