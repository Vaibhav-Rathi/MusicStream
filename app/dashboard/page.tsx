"use client"

import type React from "react"
import axios from 'axios'
import { useState, useEffect, useRef } from "react"
import { ThumbsUp, Music, ExternalLink, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import Image from "next/image"

type StreamType = "YOUTUBE" | "SPOTIFY"

interface Upvote {
  id: string
  userId: string
  value: number 
}

interface Stream {
  id: string
  type: StreamType
  url: string
  extractedId: string
  thumbnailUrl: string
  title: string
  active: boolean
  upvotes: Upvote[]
  userId: string
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          events?: {
            onReady?: (event: YT.PlayerEvent) => void;
            onStateChange?: (event: YT.OnStateChangeEvent) => void;
          };
          playerVars?: Record<string, string | number | boolean>; // Specify more specific type
        }
      ) => YT.Player;
      PlayerState: {
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function StreamPage() {
  const [videoUrl, setVideoUrl] = useState("")
  const [videoPreview, setVideoPreview] = useState<{ id: string; title: string; thumbnail: string } | null>(null)
  const [currentStream, setCurrentStream] = useState<Stream | null>(null)
  const [queue, setQueue] = useState<Stream[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const playerRef = useRef<YT.Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [lastPolled, setLastPolled] = useState(Date.now())
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  useEffect(() => {    
    const pollData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/streams/all`);
        const fetchedStreams = response.data;
        const active = fetchedStreams.find((stream: Stream) => stream.active === true);
        const queueItems = fetchedStreams.filter((stream: Stream) => stream.active === false);
        const sortedQueue = sortQueueByVotes(queueItems);
        
        if (JSON.stringify(sortedQueue.map(s => s.id)) !== JSON.stringify(queue.map(s => s.id)) ||
            JSON.stringify(sortedQueue.map(s => s.upvotes?.length)) !== JSON.stringify(queue.map(s => s.upvotes?.length))) {
          setQueue(sortedQueue);
        }
        
        // Only update current stream if it's different
        if (active && (!currentStream || active.id !== currentStream.id)) {
          setCurrentStream(active);
        } else if (!active && currentStream) {
          setCurrentStream(null);
        }
        
        setLastPolled(Date.now());
      } catch (error) {
        console.error('Error polling streams:', error);
      }
    };

    // Set up polling every 3 seconds
    pollingInterval.current = setInterval(pollData, 3000);
    
    // Clean up on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [queue, currentStream?.id]); // Re-establish the interval if these change

  useEffect(() => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = initializePlayer
    
    return () => {
      window.onYouTubeIframeAPIReady = () => {}
    }
  })

  useEffect(() => {
    if (currentStream && window.YT && window.YT.Player) {
      initializePlayer()
    }
  }, [currentStream])

  const initializePlayer = () => {
    if (!currentStream || !playerContainerRef.current) return;
  
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(currentStream.extractedId);
    } else {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: currentStream.extractedId,
        events: {
          onStateChange: onPlayerStateChange,
          onReady: (event: YT.PlayerEvent) => {
            event.target.playVideo();
          }
        },
        playerVars: {
          autoplay: 1,
          controls: 1
        }
      });
    }
  };
  
  
  const onPlayerStateChange = (event: YT.PlayerEvent) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      playNextSong()
    }
  }
  
  const playNextSong = async () => {
    const previousStreamId = currentStream?.id
    
    if (queue.length === 0) {
      if (previousStreamId) {
        try {
          await axios.delete(`${baseUrl}/api/streams/delete?streamId=${previousStreamId}`)
          console.log("Previous stream deleted successfully")
        } catch (error) {
          console.error("Error deleting previous stream:", error)
        } finally {
          setCurrentStream(null)
        }
      } else {
        setCurrentStream(null)
      }
      return
    }
    
    try {
      const nextSong = queue[0]
      
      if (previousStreamId) {
        try {
          await axios.delete(`${baseUrl}/api/streams/delete?streamId=${previousStreamId}`)
          console.log("Previous stream deleted successfully")
        } catch (deleteError) {
          console.error("Error deleting previous stream:", deleteError)
        }
      }
      
      try {
        await axios.patch(`${baseUrl}/api/streams/activate?songId=${nextSong.id}`)
        console.log("Next song activated successfully")
      } catch (activateError) {
        console.error("Error activating next song:", activateError)
        try {
          await axios.patch(`${baseUrl}/api/streams/activate?songId=${nextSong.id}`)
          console.log("Next song activated with GET method")
        } catch (fallbackError) {
          console.error("Fallback activation also failed:", fallbackError)
        }
      }
      
      setQueue(prevQueue => sortQueueByVotes(prevQueue.slice(1)))
      setCurrentStream(nextSong)
      
      setTimeout(() => {
        if (playerRef.current && nextSong) {
          if (playerRef.current.loadVideoById) {
            playerRef.current.loadVideoById(nextSong.extractedId)
          } else {
            initializePlayer()
          }
        } else {
          initializePlayer()
        }
      }, 50)
      
    } catch (error) {
      console.error('Error playing next song:', error)
      setError("Failed to play next song. Please try again.")
    }
  }

  useEffect(() => {
    const fetchId = async () => {
      try {
        const email = localStorage.getItem('email')
        const response = await axios.get(`${baseUrl}/api/fetchId?email=${email}`);
        const userId = response.data?.id;                   
        if (userId) {
          await localStorage.setItem("userId", userId);
          setCurrentUserId(userId);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    const fetchStreams = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/streams/all`);
        const fetchedStreams = response.data;
        const active = fetchedStreams.find((stream:Stream) => stream.active === true);
        const queueItems = fetchedStreams.filter((stream:Stream) => stream.active === false);
        const sortedQueue = sortQueueByVotes(queueItems);
        setCurrentStream(active || null);
        setQueue(sortedQueue);
      } catch (error) {
        console.error('Error fetching streams:', error);
        setError("Failed to load streams. Please try again later.");
      }
    };
    
    setTimeout(() => {
      fetchId();
    }, 0);
    
    fetchStreams();
  }, [baseUrl]);

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setVideoUrl(url)
    setError("")
    
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}$/;
  
    if (!videoUrl || !youtubeRegex.test(videoUrl.trim())) {
      setError("Please enter a valid YouTube URL");
      return;
    }
  
    try {
      setIsSubmitting(true);
  
      const response = await axios.post(`${baseUrl}/api/streams`, {
        url: videoUrl,
        creatorId: localStorage.getItem('userId')
      });
  
      const newVideo = response.data.Stream_Created;
      setQueue((prevQueue) => sortQueueByVotes([...prevQueue, newVideo]));
  
      setVideoUrl("");
      setVideoPreview(null);
    } catch (error) {
      console.log(error);
      setError("Failed to add video to queue");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVote = async (streamId: string, isUpvoted: boolean) => {
    try {
      const endpoint = isUpvoted ? 
        `${baseUrl}/api/streams/downvote` : 
        `${baseUrl}/api/streams/upvote`;
      
      await axios.post(endpoint, {
        streamId: streamId
      });
      
      setQueue(prevQueue => {
        const updatedQueue = prevQueue.map(stream => {
          if (stream.id === streamId) {
            const updatedStream = {...stream};
            
            const existingUpvoteIndex = updatedStream.upvotes?.findIndex(
              upvote => upvote.userId === currentUserId
            );
            
            if (isUpvoted && existingUpvoteIndex !== undefined && existingUpvoteIndex >= 0) {
              updatedStream.upvotes = [
                ...updatedStream.upvotes.slice(0, existingUpvoteIndex),
                ...updatedStream.upvotes.slice(existingUpvoteIndex + 1)
              ];
            } 
            else if (!isUpvoted) {
              updatedStream.upvotes = [
                ...(updatedStream.upvotes || []),
                { id: `temp-${Date.now()}`, userId: currentUserId, value: 1 }
              ];
            }
            
            return updatedStream;
          }
          return stream;
        });
        
        return sortQueueByVotes(updatedQueue);
      });
      
    } catch (error) {
      console.error('Error toggling vote:', error);
      setError("Failed to register vote");
    }
  }

  const getVoteCount = (stream: Stream) => {
    return (stream.upvotes ?? []).length;
  }
  
  const sortQueueByVotes = (queue: Stream[]) => {
    return [...queue].sort((a, b) => getVoteCount(b) - getVoteCount(a));
  }

  const isUpvotedByUser = (stream: Stream) => {
    return (stream.upvotes ?? []).some(upvote => upvote.userId === currentUserId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="py-4 border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-8xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div >
              <Music className="text-purple-500" />
            </div>

            {/* Center title */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-400">
              Creators Stream
            </div>

            {/* Logout button */}
            <Button
              onClick={() => logout()}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-0"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-4 py-6">
        {/* YouTube-style layout with video on left and queue on right */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Video Player and Add to Queue form */}
          <div className="w-full lg:w-8/12 space-y-6">
            {/* Video Player Section */}
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              <div ref={playerContainerRef} className="w-full aspect-video">
                {currentStream ? (
                  <div id="youtube-player" className="w-full h-full"></div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center text-gray-400 bg-gray-900">
                    <div>
                      <p className="mb-4">No video is currently playing</p>
                      {queue.length > 0 && (
                        <Button 
                          onClick={playNextSong} 
                          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
                        >
                          Play Next Song
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {currentStream && (
                <div className="p-4 bg-gray-900">
                  <h3 className="text-lg font-semibold mb-2 text-white">{currentStream.title}</h3>
                  <a
                    href={currentStream.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 hover:underline text-sm"
                  >
                    <ExternalLink size={16} />
                    <span>Watch on YouTube</span>
                  </a>
                </div>
              )}
            </div>

            {/* Add to Queue Form */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-white">Add to Queue</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={handleUrlChange}
                    placeholder="Paste YouTube URL here"
                    className="w-full py-3 pl-10 pr-4 border border-gray-700 bg-gray-900 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white text-sm"
                    disabled={isSubmitting}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                {videoPreview && (
                  <div className="flex gap-4 bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <Image
                      src={videoPreview.thumbnail || "/placeholder.svg"}
                      alt={videoPreview.title}
                      className="w-30 h-[68px] object-cover rounded"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <p className="text-sm font-medium line-clamp-2 text-white">{videoPreview.title}</p>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-md py-2 px-4 text-sm font-medium self-end hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity"
                        disabled={isSubmitting}
                      >
                        <Plus size={16} />
                        <span>Add to Queue</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Always show submit button if no preview */}
                {!videoPreview && videoUrl && (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-md py-2 px-4 text-sm font-medium self-end hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity"
                    disabled={isSubmitting}
                  >
                    <Plus size={16} />
                    <span>Add to Queue</span>
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Right side - Queue */}
          <div className="w-full lg:w-4/12">
            <div className="bg-gray-800 rounded-lg p-5 shadow-xl h-full">
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                <span>Coming Up Next</span>
                <span className="ml-2 text-sm text-gray-400 font-normal">({queue.length})</span>
              </h2>
              
              <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
                {queue.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <p>No songs in queue</p>
                    <p className="text-sm mt-2">Be the first to add one!</p>
                  </div>
                ) : (
                  queue.map((stream, index) => {
                    const voteCount = getVoteCount(stream);
                    const isUserUpvoted = isUpvotedByUser(stream);

                    return (
                      <div
                        key={stream.id || index}
                        className="flex gap-3 p-3 rounded-lg bg-gray-900/80 border border-gray-700 hover:bg-gray-900 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center gap-1 mr-1">
                          <button
                            className={`flex items-center justify-center p-1.5 rounded-full hover:bg-gray-800 transition-colors ${
                              isUserUpvoted ? "text-purple-500 bg-gray-800" : "text-gray-500"
                            }`}
                            onClick={() => handleVote(stream.id, isUserUpvoted)}
                            aria-label={isUserUpvoted ? "Remove upvote" : "Upvote"}
                          >
                            <ThumbsUp size={16} />
                          </button>
                          <span className="font-semibold text-gray-300 text-sm">{voteCount}</span>
                        </div>
                        
                        <Image
                          src={stream.thumbnailUrl || "/placeholder.svg"}
                          alt={stream.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        
                        <div className="flex-1 flex flex-col justify-between overflow-hidden">
                          <h3 className="text-sm font-medium line-clamp-2 text-gray-200">{stream.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">Added by User #{stream.userId?.substring(0, 8)}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Status indicator - shows last sync time */}
      <div className="fixed bottom-2 right-2 text-xs text-gray-500 bg-gray-900 bg-opacity-60 backdrop-blur-sm px-2 py-1 rounded-md">
        Last updated: {new Date(lastPolled).toLocaleTimeString()}
      </div>
    </div>
  )
}