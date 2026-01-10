import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const { prompt } = body

    // Validation: Check if prompt exists
    if (prompt === undefined || prompt === null) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Validation: Check if prompt is a string
    if (typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt must be a string" }, { status: 400 })
    }

    // Validation: Check if prompt is not empty
    if (prompt.trim() === "") {
      return NextResponse.json({ error: "Prompt cannot be empty" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 },
      )
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt: prompt.trim(),
        n: 1,
        size: "512x512",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const statusCode = response.status
      const errorMessage = errorData.error?.message || errorData.error?.code || ""
      const errorType = errorData.error?.type || ""
      
      console.error("OpenAI API error:", {
        status: statusCode,
        error: errorData,
        message: errorMessage,
        type: errorType
      })
      
      // Provide helpful error messages based on status codes and error types
      let userMessage = errorMessage
      
      // Check for billing limit errors (can appear in various forms)
      if (
        errorMessage.toLowerCase().includes("billing") && 
        (errorMessage.toLowerCase().includes("limit") || errorMessage.toLowerCase().includes("quota") || errorMessage.toLowerCase().includes("hard limit"))
      ) {
        userMessage = "Your OpenAI account has reached its billing limit. Please add payment method or increase your spending limit at https://platform.openai.com/account/billing/limits to continue generating images."
      } else if (statusCode === 401) {
        userMessage = "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable and ensure it's correct."
      } else if (statusCode === 429) {
        if (errorMessage.toLowerCase().includes("quota") || errorMessage.toLowerCase().includes("billing")) {
          userMessage = "You've reached your usage quota. Please check your OpenAI billing and usage limits at https://platform.openai.com/usage"
        } else {
          userMessage = "Rate limit exceeded. You've made too many requests. Please wait a moment and try again."
        }
      } else if (statusCode === 400) {
        userMessage = errorMessage || "Invalid request. Please check your prompt and try again."
      } else if (statusCode === 402) {
        userMessage = "Payment required. Your OpenAI account needs payment information. Please add a payment method at https://platform.openai.com/account/billing"
      } else if (statusCode === 403) {
        if (errorMessage.toLowerCase().includes("billing") || errorMessage.toLowerCase().includes("quota")) {
          userMessage = "Billing issue detected. Please check your OpenAI account billing settings and payment method at https://platform.openai.com/account/billing"
        } else {
          userMessage = "Access forbidden. Please check your OpenAI API key permissions and account status."
        }
      } else if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
        userMessage = "OpenAI service is temporarily unavailable. Please try again in a moment."
      } else if (!userMessage) {
        userMessage = `Failed to generate image. Status: ${statusCode}. Please check your OpenAI API key and account settings.`
      }
      
      return NextResponse.json(
        { error: userMessage },
        { status: 500 },
      )
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      console.error("No image URL in OpenAI response:", data)
      return NextResponse.json(
        { error: "Failed to generate image: No image URL returned" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      imageUrl,
      prompt: prompt.trim(),
    })
  } catch (error) {
    console.error("Error in generate API:", error)
    
    let errorMessage = "Failed to generate image"
    if (error instanceof TypeError && error.message.includes("fetch")) {
      errorMessage = "Network error: Unable to connect to OpenAI API. Please check your internet connection."
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    )
  }
}
