"use client"

import { motion } from "framer-motion"
import { Pacifico } from "next/font/google"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Mic, Download, MicOff, Loader2 } from "lucide-react"
import { WavyBackground } from "@/components/ui/wavy-background"
import { useState, useRef, useEffect } from "react"
import { transcribeAudio } from "../actions"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

function WavePattern() {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-0 transform z-20">
      <svg
        className="relative block w-full h-[70px] sm:h-[100px] md:h-[120px]"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,0,0,0z"
          className="fill-[#030303] opacity-50"
        ></path>
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          className="fill-[#030303] opacity-25"
        ></path>
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          className="fill-[#030303]"
        ></path>
      </svg>
    </div>
  )
}

export default function HeroGeometric({
  badge = "Kokonut UI",
  title1 = "Whisper Your",
  title2 = "Words to Life",
}: {
  badge?: string
  title1?: string
  title2?: string
}) {
  // State for recording functionality
  const [isRecording, setIsRecording] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [loading, setLoading] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  // Handle requesting microphone permissions
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)
      setHasPermission(true)
      return stream
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setHasPermission(false)
      return null
    }
  }

  // Handle start recording
  const startRecording = async () => {
    try {
      // If already recording, stop first
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      
      // Reset state and clear previous recording
      audioChunksRef.current = [];
      setTranscribedText("");
      
      // Get a fresh stream each time to avoid issues with reusing streams
      if (audioStream) {
        // Stop all previous tracks
        audioStream.getTracks().forEach(track => track.stop());
      }
      
      // Get a fresh audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setHasPermission(true);
      
      // Set up new MediaRecorder with the stream
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      // Configure event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          if (audioChunksRef.current.length === 0) {
            setLoading(false);
            return;
          }
          
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          await processAudio(audioBlob);
        } catch (error) {
          console.error("Error in onstop handler:", error);
          setLoading(false);
          setTranscribedText("An error occurred while processing your audio.");
        }
      };
      
      // Start recording immediately - request data every 1 second
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  }

  // Handle stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setLoading(true);
        
        // Don't stop tracks here - we'll reuse the audio stream reference
        // but get a fresh stream on next recording
      } catch (error) {
        console.error("Error stopping recording:", error);
        setIsRecording(false);
        setLoading(false);
      }
    }
  }

  // Process the audio and get transcription
  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert audio blob to base64
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result as string
          
          // Call the server action to transcribe
          const result = await transcribeAudio(base64Audio)
          
          if (result.success && result.text) {
            setTranscribedText(result.text)
          } else {
            console.error("Transcription failed:", result.error)
            setTranscribedText("Sorry, we couldn't transcribe your audio. Please try again.")
          }
        } catch (error) {
          console.error("Error in onloadend handler:", error)
          setTranscribedText("An error occurred while processing your audio.")
        } finally {
          setLoading(false)
        }
      }
    } catch (error) {
      console.error("Error processing audio:", error)
      setLoading(false)
      setTranscribedText("An error occurred while processing your audio.")
    }
  }

  // Clean up audio stream and recorder on component unmount
  useEffect(() => {
    return () => {
      // Stop any ongoing recording
      if (mediaRecorderRef.current && isRecording) {
        try {
          mediaRecorderRef.current.stop()
        } catch (e) {
          console.error("Error stopping recorder on unmount:", e)
        }
      }
      
      // Stop audio tracks
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [audioStream, isRecording])

  return (
    <>
      {/* Glassmorphic Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="relative">
          {/* Light effect */}
          <div className="absolute -top-20 left-1/4 w-1/2 h-32 bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-pink-600/20 blur-3xl rounded-full transform"></div>
          
          {/* Glassmorphic bar */}
          <div className="relative backdrop-blur-md border-b border-white/10 bg-black/10">
            <div className="container mx-auto px-4 md:px-6 py-3 flex justify-end items-center">
              <nav className="flex items-center gap-2 md:gap-4">
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-3 py-1.5 text-sm">
                  Sign Up
                </Button>
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-3 py-1.5 text-sm">
                  Login
                </Button>
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-3 py-1.5 text-sm">
                  Pricing
                </Button>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full px-4 py-1.5 text-sm flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

        <div className="absolute inset-0 overflow-hidden">
          <ElegantShape
            delay={0.3}
            width={600}
            height={140}
            rotate={12}
            gradient="from-indigo-500/[0.15]"
            className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
          />

          <ElegantShape
            delay={0.5}
            width={500}
            height={120}
            rotate={-15}
            gradient="from-rose-500/[0.15]"
            className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
          />

          <ElegantShape
            delay={0.4}
            width={300}
            height={80}
            rotate={-8}
            gradient="from-violet-500/[0.15]"
            className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
          />

          <ElegantShape
            delay={0.6}
            width={200}
            height={60}
            rotate={20}
            gradient="from-amber-500/[0.15]"
            className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
          />

          <ElegantShape
            delay={0.7}
            width={150}
            height={40}
            rotate={-25}
            gradient="from-cyan-500/[0.15]"
            className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">{title1}</span>
                <br />
                <span
                  className={cn(
                    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 ",
                    pacifico.className,
                  )}
                >
                  {title2}
                </span>
              </h1>
            </motion.div>

            <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
              <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
                Command Friday to write effortlessly with just your voice.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

        <WavePattern />
      </div>

      <div className="relative bg-[#030303] -mt-24 md:-mt-32">
        <WavyBackground 
          className="py-12 md:py-20" 
          containerClassName="min-h-[250px] md:min-h-[350px]"
          colors={["#4f46e5", "#8b5cf6", "#d946ef", "#ec4899"]}
          waveWidth={100}
          backgroundFill="#030303"
          blur={10}
          speed="slow"
          waveOpacity={0.6}
        >
          <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={cn(
                "transform transition-all duration-500",
                (transcribedText || loading) && "md:translate-x-[-50px]"
              )}
            >
              <Button
                className="group relative overflow-hidden rounded-full px-8 py-7 text-lg font-medium transition-all duration-300 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#030303]"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)",
                  boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.6)",
                }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="h-5 w-5 text-red-400" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                  {loading ? "Processing..." : isRecording ? "Stop Recording" : "Talk with Friday"}
                </span>
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                  <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></span>
                </span>
              </Button>

              {/* Permission status indicator */}
              {hasPermission === false && (
                <p className="text-red-400 text-sm mt-3 text-center">
                  Microphone access denied. Please allow microphone access to use this feature.
                </p>
              )}
            </motion.div>

            {/* Transcribed text field */}
            {(transcribedText || loading) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="md:flex-1 w-full md:w-auto"
              >
                <div className="relative p-0.5 rounded-xl overflow-hidden">
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 animate-gradient-slow"></div>
                  
                  {/* Inner content */}
                  <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-white font-medium mb-3">Transcribed Text:</h3>
                    
                    {loading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                        <span className="ml-3 text-white/70">Transcribing your audio...</span>
                      </div>
                    ) : (
                      <div className="min-h-32 text-white/90 leading-relaxed whitespace-pre-wrap">
                        {transcribedText}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </WavyBackground>
      </div>

      {/* Two-step process section */}
      <div className="relative bg-[#030303] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-white"
          >
            Get Started in Three Simple Steps
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-7xl mx-auto">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 blur-lg group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-[#0c0c0c] p-1 rounded-2xl h-full">
                <div className="bg-[#0c0c0c] rounded-xl p-6 md:p-8 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white font-bold mr-3">1</span>
                    <h3 className="text-xl md:text-2xl font-bold text-white">Give Permissions</h3>
                  </div>
                  <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg border-2 border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                    <Image
                      src="/Friday_Assets/permission1.png"
                      alt="Allow microphone permissions"
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <p className="text-white/70 mt-auto">Allow Friday to access your microphone to start dictating.</p>
                </div>
              </div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-70 blur-lg group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-[#0c0c0c] p-1 rounded-2xl h-full">
                <div className="bg-[#0c0c0c] rounded-xl p-6 md:p-8 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-500 text-white font-bold mr-3">2</span>
                    <h3 className="text-xl md:text-2xl font-bold text-white">Start Vibing</h3>
                  </div>
                  <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg border-2 border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent"></div>
                    <Image
                      src="/Friday_Assets/record.png"
                      alt="Start recording and vibing"
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <p className="text-white/70 mt-auto">Speak naturally and watch Friday transform your voice into text.</p>
                </div>
              </div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-70 blur-lg group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-[#0c0c0c] p-1 rounded-2xl h-full">
                <div className="bg-[#0c0c0c] rounded-xl p-6 md:p-8 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500 text-white font-bold mr-3">3</span>
                    <h3 className="text-xl md:text-2xl font-bold text-white">Boost Productivity</h3>
                  </div>
                  <div className="relative w-full mb-5 flex flex-col items-center">
                    <div className="flex items-center justify-center space-x-1 my-6">
                      <div className="flex items-center justify-center w-12 h-12 bg-slate-800 rounded-md border border-slate-700 shadow-lg">
                        <span className="text-white font-medium">⌘</span>
                      </div>
                      <span className="text-white/60 mx-1">+</span>
                      <div className="flex items-center justify-center w-12 h-12 bg-slate-800 rounded-md border border-slate-700 shadow-lg">
                        <span className="text-white font-medium">⇧</span>
                      </div>
                      <span className="text-white/60 mx-1">+</span>
                      <div className="flex items-center justify-center w-12 h-12 bg-slate-800 rounded-md border border-slate-700 shadow-lg">
                        <span className="text-white font-medium">F</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4 mt-4 border border-slate-700/50 w-full">
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse mr-3"></div>
                        <span className="text-white/90 text-lg">Recording...</span>
                      </div>
                      <p className="text-white/60 italic">"Write a message to my team about the new project..."</p>
                    </div>
                    
                    <div className="relative w-full h-32 mt-6 rounded-lg bg-slate-800/50 border border-slate-700/50 overflow-hidden p-4">
                      <div className="absolute top-2 left-2 flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="mt-6 text-white/80 text-sm font-mono">
                        <span className="text-cyan-400">{'>'}</span> I'm excited to share updates about our new project. Let's meet tomorrow to discuss the next steps and align on our priorities.
                        <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-white/80"></span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 mt-auto">Use keyboard shortcuts to activate Friday and paste text directly where your cursor is.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative bg-[#030303] py-20 md:py-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_40%)]"></div>
          </div>
          <div className="absolute bottom-0 right-0 w-full h-full opacity-30">
            <div className="absolute -bottom-[50%] -right-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.15),transparent_40%)]"></div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
                Questions
              </span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Everything you need to know about Friday and how it can transform your workflow.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* FAQ Item 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="mb-8 group"
            >
              <div className="relative bg-[#0c0c0c] rounded-xl p-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 backdrop-blur-3xl bg-black/50"></div>
                <div className="relative bg-[#0c0c0c]/80 rounded-xl p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-start">
                    <span className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full w-8 h-8 flex items-center justify-center text-white mr-3 flex-shrink-0">Q</span>
                    <span>What operating systems do you support?</span>
                  </h3>
                  <div className="pl-11">
                    <p className="text-white/70">
                      Only MacOS for now. If you want Friday on Windows too, drop an email at{" "}
                      <a href="mailto:ali@showces.com" className="text-indigo-400 hover:text-indigo-300 transition-colors underline">
                        ali@showces.com
                      </a>{" "}
                      and we will send you the Windows installer.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FAQ Item 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-8 group"
            >
              <div className="relative bg-[#0c0c0c] rounded-xl p-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 backdrop-blur-3xl bg-black/50"></div>
                <div className="relative bg-[#0c0c0c]/80 rounded-xl p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-start">
                    <span className="bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full w-8 h-8 flex items-center justify-center text-white mr-3 flex-shrink-0">Q</span>
                    <span>What languages does it transcribe?</span>
                  </h3>
                  <div className="pl-11">
                    <p className="text-white/70">
                      English only for now, with other languages coming soon. If you need support for other languages right now, email{" "}
                      <a href="mailto:ali@showces.com" className="text-indigo-400 hover:text-indigo-300 transition-colors underline">
                        ali@showces.com
                      </a>{" "}
                      and we'll help you out.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FAQ Item 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="mb-8 group"
            >
              <div className="relative bg-[#0c0c0c] rounded-xl p-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 backdrop-blur-3xl bg-black/50"></div>
                <div className="relative bg-[#0c0c0c]/80 rounded-xl p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-start">
                    <span className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full w-8 h-8 flex items-center justify-center text-white mr-3 flex-shrink-0">Q</span>
                    <span>How fast does it transcribe?</span>
                  </h3>
                  <div className="pl-11">
                    <p className="text-white/70">
                      Short answer is, faster than any existing product out there. Don't believe us? Download it and try. You'll be shocked at the speed and accuracy of Friday's transcription capabilities.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-[#030303] border-t border-white/5 py-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
            <div className="mb-2 md:mb-0">
              Built with <span className="text-pink-500 mx-1">♥</span> & few shots of caffeine
            </div>
            <div>
              © {new Date().getFullYear()} Transpify. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

