"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: number
  text: string
  sender: string
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { id: Date.now(), text: inputMessage, sender: "You" }])
      setInputMessage("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <span className="text-xs text-slate-light/60">{message.sender}</span>
            <p className="bg-slate-dark/20 rounded-lg p-2 text-slate-light">{message.text}</p>
          </div>
        ))}
      </ScrollArea>
      <div className="border-t border-slate-light/10 p-4 flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow rounded-md border border-slate-light/10 bg-slate-dark/10 p-2 font-mono text-slate-light focus:border-slate-light focus:outline-none"
          placeholder="Type your message..."
        />
        <Button onClick={handleSendMessage} className="bg-slate-light font-mono text-background hover:bg-slate-dark">
          Send
        </Button>
      </div>
    </div>
  )
}

