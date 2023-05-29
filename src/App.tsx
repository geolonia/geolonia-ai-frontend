import Map from './Map'
import './App.scss';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Instruction, Message } from './types';

import Papa from "papaparse";

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
  const mapRef = useRef<any>(null);
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

    const body = await resp.json() as { lines: { content: string }[] };

    const {
      instructions,
      lines,
    } = body.lines.reduce<{
      inStyleInstructions: boolean,
      instructions: Instruction[],
      lines: string[],
    }>((out, x) => {
      if (x.content === 'START') {
        return { ...out, inStyleInstructions: true };
      } else if (x.content === 'END') {
        return {
          ...out,
          inStyleInstructions: false,
          lines: [...out.lines, 'スタイルを変更しました。'],
        };
      } else if (out.inStyleInstructions) {
        const line = Papa.parse<string[]>(x.content.replace(/",\s+/g, '",'));
        const [layerName, propertyPath, value] = line.data[0];
        const multipleLayers = layerName.split(/,\s+/);
        const instructions: Instruction[] = [];
        for (const layerName of multipleLayers) {
          instructions.push({
            type: 'STYLE_CHANGE',
            layerName,
            propertyPath,
            value,
          });
        }
        return {
          ...out,
          instructions: [...out.instructions, ...instructions],
        };
      }

      return {
        ...out,
        lines: [...out.lines, x.content],
      };
    }, {
      inStyleInstructions: false,
      instructions: [],
      lines: [],
    });

    console.log("instructions", instructions);
    const map = mapRef.current;
    if (map) {
      for (const instruction of instructions) {
        if (instruction.type === 'STYLE_CHANGE') {
          if (instruction.propertyPath.startsWith('paint.')) {
            map.setPaintProperty(
              instruction.layerName,
              instruction.propertyPath.replace(/^paint\./, ''),
              instruction.value,
            );
          } else if (instruction.propertyPath.startsWith('layout.')) {
            map.setLayoutProperty(
              instruction.layerName,
              instruction.propertyPath.replace(/^layout\./, ''),
              instruction.value,
            );
          } else if (instruction.propertyPath.startsWith('visibility.')) {
            map.setVisibilityProperty(
              instruction.layerName,
              instruction.propertyPath.replace(/^visibility\./, ''),
              instruction.value,
            );
          }
        }
      }
    }

    setMessages((prev) => [
      ...prev.filter((x) => !x.pending),
      ...lines.map((x) => ({ type: 'response' as const, text: x })),
    ]);
  }, []);

  useLayoutEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo(0, chatContainerRef.current.scrollHeight);
    }
  }, [messages]);

  const onMapLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  return (
    <div className="App">
      <div className="map-contaienr">
        <Map className='map' onLoad={onMapLoad} />
      </div>
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
