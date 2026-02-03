import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase';
import { 
  collection, query, where, getDocs, addDoc, 
  orderBy, onSnapshot, serverTimestamp, doc, updateDoc 
} from 'firebase/firestore';
import { 
  Search, Send, Paperclip, MoreVertical, Phone, 
  Video, Smile, Check, CheckCheck, FileText, 
  ArrowRight, Sparkles, MessageCircle, User,
  Plus, Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  useEffect(() => {
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(data.sort((a, b) => (b.lastUpdate?.seconds || 0) - (a.lastUpdate?.seconds || 0)));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "conversations", selectedChat.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      text: newMessage,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "conversations", selectedChat.id, "messages"), messageData);
      await updateDoc(doc(db, "conversations", selectedChat.id), {
        lastMessage: newMessage,
        lastUpdate: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex premium-card overflow-hidden bg-white border-none shadow-2xl">
      {/* Sidebar: Conversations List */}
      <aside className="w-96 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Messages</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {loading ? (
            <div className="p-8 text-center animate-pulse space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
                <MessageCircle size={32} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Active Dialogues</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button 
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`w-full p-4 rounded-2xl flex items-center space-x-4 transition-all group ${
                  selectedChat?.id === conv.id 
                    ? 'bg-white shadow-lg shadow-primary-500/5 ring-1 ring-primary-500/20' 
                    : 'hover:bg-white hover:shadow-sm'
                }`}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-black text-lg">
                    {conv?.funderName?.charAt(0) || "?"}
                  </div>
                  {conv?.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-black text-slate-900 truncate tracking-tight">{conv?.funderName || "Anonymous"}</p>
                    <span className="text-[9px] font-black text-slate-400 uppercase">12:45 PM</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Window */}
      <main className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary-600 font-black">
                  {selectedChat?.funderName?.charAt(0) || "?"}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">{selectedChat?.funderName || "Anonymous"}</h3>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse" /> Active Match Discussion
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"><Phone size={20} /></button>
                <button className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"><Video size={20} /></button>
                <div className="w-px h-6 bg-slate-100 mx-2" />
                <button className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"><MoreVertical size={20} /></button>
              </div>
            </header>

            {/* Conversion Banner */}
            <div className="px-8 py-4 bg-indigo-600/5 border-b border-indigo-600/10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">Ready to formalize this discussion?</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">AI can generate a draft proposal from this conversation.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/proposals', { state: { conversationId: selectedChat.id }})}
                className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center"
              >
                Generate Proposal <ArrowRight size={14} className="ml-2" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/30">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === auth.currentUser.uid;
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-5 py-3.5 rounded-3xl text-sm font-medium shadow-sm border ${
                        isMe 
                          ? 'bg-primary-600 text-white border-primary-500 rounded-tr-none' 
                          : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center space-x-2 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">12:45 PM</span>
                        {isMe && <CheckCheck size={12} className="text-primary-500" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <footer className="p-6 border-t border-slate-100 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:border-primary-500/50 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all">
                <button type="button" className="p-3 text-slate-400 hover:text-primary-600 transition-colors"><Paperclip size={20} /></button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
                <button type="button" className="p-3 text-slate-400 hover:text-amber-500 transition-colors"><Smile size={20} /></button>
                <button 
                  type="submit" 
                  className="bg-primary-600 text-white p-3 rounded-full shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-8 text-center">
            <div className="relative">
              <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
                <MessageCircle size={64} />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-2 -right-2 w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 shadow-lg"
              >
                <Sparkles size={20} />
              </motion.div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Intelligent Inbox</h2>
              <p className="text-slate-500 font-medium max-w-sm">Select a conversation to begin discussing funding milestones and technical integration.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
