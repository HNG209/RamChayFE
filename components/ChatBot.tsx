"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ProductItem {
    id: number
    name: string
    price: number
    indexImage: string
}

interface Message {
    id: number
    text: string
    sender: "user" | "bot"
    timestamp: Date
    products?: ProductItem[] // Danh sách sản phẩm từ backend
}

export default function ChatBot() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Xin chào! Tôi là trợ lý ảo của RamChay. Tôi có thể giúp gì cho bạn?",
            sender: "bot",
            timestamp: new Date()
        }
    ])
    const [inputText, setInputText] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputText.trim()) return

        // Add user message
        const userMessage: Message = {
            id: Date.now(),
            text: inputText,
            sender: "user",
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setInputText("")
        setIsTyping(true)

        // TODO: Replace with actual API call to chatbot backend
        // Expected response format from backend:
        // {
        //   "answer": string,
        //   "responseList": [{ id, name, indexImage, price }]
        // }
        setTimeout(() => {
            // Mock response với responseList (demo theo format backend)
            const mockResponse = {
                answer: "Có thật và mì Xào Giòn Chay (Món ăn số 1) là một món ăn chay...",
                responseList: [
                    {
                        id: 1,
                        name: "Bắp cải",
                        indexImage: "https://res.cloudinary.com/dqoallgsf/image/upload/v1765191181/opwabxdx0gncv0tx37ik.png",
                        price: 25000
                    }
                ]
            }

            const botMessage: Message = {
                id: Date.now() + 1,
                text: mockResponse.answer,
                sender: "bot",
                timestamp: new Date(),
                products: mockResponse.responseList // Nếu responseList rỗng [] thì chỉ hiện text
            }
            setMessages(prev => [...prev, botMessage])
            setIsTyping(false)
        }, 1000)
    }

    return (
        <>
            {/* Chat Modal */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 md:right-8 w-[90vw] md:w-96 h-128 bg-white rounded-2xl shadow-2xl border-2 border-green-200 z-50 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-green-500 to-lime-500 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-2xl">🤖</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">RamChay Assistant</h3>
                                <p className="text-xs text-white/90">Luôn sẵn sàng hỗ trợ</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-50/30">
                        {messages.map((message) => (
                            <div key={message.id}>
                                {/* Text Message */}
                                <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${message.sender === "user"
                                            ? "bg-chocolate text-white rounded-br-sm"
                                            : "bg-white border border-green-200 text-gray-800 rounded-bl-sm"
                                            }`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                        <p className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-gray-400"}`}>
                                            {message.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>

                                {/* Product Cards (chỉ hiện khi có products) */}
                                {message.products && message.products.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {message.products.map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() => router.push(`/products/${product.id}`)}
                                                className="bg-white border border-green-200 rounded-lg p-3 hover:shadow-md hover:border-chocolate transition-all cursor-pointer group"
                                            >
                                                <div className="flex gap-3">
                                                    {/* Product Image */}
                                                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                        <Image
                                                            src={product.indexImage}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform"
                                                        />
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-chocolate transition-colors">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-chocolate font-bold mt-1">
                                                            {product.price.toLocaleString()}đ
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-green-200 rounded-2xl rounded-bl-sm px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-green-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-4 py-2 border border-green-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="bg-chocolate hover:bg-chocolate/90 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-4 md:right-8 w-14 h-14 bg-linear-to-r from-green-500 to-lime-500 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50 flex items-center justify-center group"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
                        {/* Notification Badge */}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                            !
                        </span>
                    </>
                )}
            </button>
        </>
    )
}
