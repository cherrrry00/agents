import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit'
import { ChevronDown, Send } from 'lucide-react';
import { toggleChat, setNewMessage, addMessage } from '../features/chat/chatSlice';
import MessageItem from './MessageItem';

const ChatPanel = () => {
  const dispatch = useDispatch();
  const { messages, newMessage } = useSelector(state => state.chat);
  const { selectedStock } = useSelector(state => state.stocks);
  const { selectedTimeframe } = useSelector(state => state.timeframe);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const newMsg = {
        user_id: nanoid(),
        session_id: 'You',
        selectedStock: selectedStock.symbol,
        text: newMessage,
        time: new Date().toISOString(),
      };

      
      
      dispatch(addMessage({ ...newMsg, time: new Date(newMsg.time).toLocaleString([],
         { hour: '2-digit', minute: '2-digit' }) 
        }));
      dispatch(setNewMessage(''));
      
      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMsg),
      });
      console.log("Raw response:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      const botResponse = {
        id: nanoid(),
        user: 'TradeBot',
        session_id: 'TradeBot',
        text: data.explanation || 'No response received.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      dispatch(addMessage(botResponse));
    }
  };

  return (
    <div className="w-100 bg-slate-900 border-l border-slate-800 flex flex-col transition-all duration-300 overflow-hidden z-30">
      <div className="flex justify-between items-center px-2 py-1 border-b border-slate-800">
        <h3 className="font-medium text-sm">Trade Chat</h3>
        <button 
          className="text-slate-400 hover:text-white"
          onClick={() => dispatch(toggleChat())}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
      </div>
      
      <div className="p-1.5 border-t border-slate-800">
        <div className="flex gap-1">
          <input
            type="text"
            className="flex-1 bg-slate-800 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ask about trading..."
            value={newMessage}
            onChange={(e) => dispatch(setNewMessage(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            className="p-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
