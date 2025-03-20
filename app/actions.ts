"use server"

import fs from 'fs'
import path from 'path'
import os from 'os'
import Groq from 'groq-sdk'

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_WHISPER_API_KEY || 'your-api-key-here',
})

/**
 * Server action to transcribe audio
 * @param audioBase64 - Base64 encoded audio data
 */
export async function transcribeAudio(audioBase64: string) {
  try {
    // Remove the data URL prefix if present
    const base64Data = audioBase64.split(',')[1] || audioBase64
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Create temporary file for the audio
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `audio-${Date.now()}.webm`)
    
    // Write the buffer to a temporary file
    fs.writeFileSync(tempFilePath, buffer)
    
    // Make the actual API call to Groq
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
    })
    
    // Clean up temporary file
    try {
      fs.unlinkSync(tempFilePath)
    } catch (error) {
      console.error('Error deleting temporary file:', error)
    }
    
    return {
      success: true,
      text: transcription.text
    }
  } catch (error) {
    console.error('Transcription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
} 