'use client';
import { useEffect, useRef, useState } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Copy, Check } from 'lucide-react';

export default function FaceTime() {
  const [peerId, setPeerId] = useState<string>('');
  const [remotePeerIdValue, setRemotePeerIdValue] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');
  
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<Peer | null>(null);
  const currentCall = useRef<MediaConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Initialize Peer (runs only on client)
    const peer = new Peer();
    
    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('call', (call) => {
      // Receiving a call
      if (window.confirm("Incoming video call! Answer?")) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((stream) => {
            localStream.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            
            call.answer(stream);
            currentCall.current = call;
            setCallStatus('connected');
            
            call.on('stream', (remoteStream) => {
              if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
            });

            call.on('close', () => endCall());
          })
          .catch((err) => console.error('Failed to get local stream', err));
      } else {
        call.close();
      }
    });

    peerInstance.current = peer;

    // Start local camera immediately
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      })
      .catch((err) => console.error('Failed to get local stream', err));

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      peer.destroy();
    };
  }, []);

  const callPeer = (remoteId: string) => {
    if (!remoteId || !peerInstance.current || !localStream.current) return;
    
    setCallStatus('calling');
    const call = peerInstance.current.call(remoteId, localStream.current);
    currentCall.current = call;

    call.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      setCallStatus('connected');
    });

    call.on('close', () => endCall());
    call.on('error', () => endCall());
  };

  const endCall = () => {
    if (currentCall.current) {
      currentCall.current.close();
      currentCall.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCallStatus('idle');
  };

  const toggleMic = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks()[0].enabled = !micEnabled;
      setMicEnabled(!micEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks()[0].enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-full bg-slate-950 relative overflow-hidden flex-col md:flex-row">
      
      {/* Sidebar for Controls */}
      <div className="w-full md:w-80 bg-black/60 border-r border-white/10 p-6 flex flex-col z-10 backdrop-blur-xl shrink-0">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Video className="text-indigo-400" /> FaceTime
        </h2>
        
        {/* My ID Section */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">My Call ID</p>
          <div className="flex items-center justify-between bg-black/40 rounded-lg p-3">
            <span className="text-emerald-400 font-mono text-sm truncate pr-2">{peerId || 'Connecting...'}</span>
            <button onClick={copyId} disabled={!peerId} className="text-slate-300 hover:text-white transition-colors p-1 bg-white/10 rounded-md">
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Share this ID with a recruiter so they can call you directly from their browser.</p>
        </div>

        {/* Make a Call Section */}
        <div className="bg-white/5 rounded-xl p-4 mb-auto border border-white/10 flex-1">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Make a Call</p>
          <input
            type="text"
            value={remotePeerIdValue}
            onChange={(e) => setRemotePeerIdValue(e.target.value)}
            placeholder="Enter Recruiter's ID"
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm mb-4 outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            onClick={() => callPeer(remotePeerIdValue)} 
            disabled={!remotePeerIdValue || callStatus !== 'idle'}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Phone size={18} /> {callStatus === 'idle' ? 'Call' : callStatus === 'calling' ? 'Calling...' : 'In Call'}
          </button>

          {callStatus === 'connected' && (
             <button 
             onClick={endCall} 
             className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-3"
           >
             <PhoneOff size={18} /> End Call
           </button>
          )}
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col">
        
        {/* Remote Video (Main) */}
        <div className="w-full h-full relative">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          {callStatus === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500">
              <VideoOff size={48} className="mb-4 opacity-50" />
              <p className="font-semibold text-lg">Waiting for connection...</p>
            </div>
          )}
        </div>

        {/* Local Video (Floating PIP) */}
        <div className="absolute top-6 right-6 w-48 h-64 bg-black rounded-2xl overflow-hidden border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-20">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${!videoEnabled && 'hidden'}`}
          />
          {!videoEnabled && (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <VideoOff size={32} className="text-slate-500" />
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md px-6 py-4 rounded-full border border-white/10 z-20 shadow-2xl">
          <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}>
            {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${videoEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}>
            {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          {callStatus === 'connected' && (
            <button onClick={endCall} className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors">
              <PhoneOff size={20} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
