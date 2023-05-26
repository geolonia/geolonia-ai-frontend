import Map from './Map'
import './App.scss';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Message } from './types';

const SingleMessage: React.FC<{ message: Message }> = ({ message }) => {
  if (message.pending) {
    return (
      <div className={`message ${message.type} is-pending`}>
        …
      </div>
    )
  }
  return (
    <div className={classNames({
      message: true,
      [message.type]: true,
      'is-pending': message.pending,
    })}>
      {message.pending ? '...' : message.text}
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
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const onSubmit = useCallback(async (text: string) => {
    setMessages((prev) => [
      ...prev,
      { type: 'request', text },
      { type: 'response', text: '', pending: true },
    ]);
    const resp = await fetch('https://slcfryujr2yuyl56jbzwqkqjt40ttaxz.lambda-url.ap-northeast-1.on.aws/', {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body = await resp.json();
    setMessages((prev) => [
      ...prev.filter((x) => !x.pending),
      ...body.lines.map((x: { content: string }) => ({ type: 'response', text: x.content })),
    ]);
  }, []);

  useLayoutEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo(0, chatContainerRef.current.scrollHeight);
    }
  }, [messages]);

  return (
    <div className="App">
      <div className="map-contaienr"><Map className='map'></Map></div>
      <div className="chat-container" ref={chatContainerRef}>
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
