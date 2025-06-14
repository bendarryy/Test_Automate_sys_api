"use client"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { useApp } from "@/contexts/app-context"

export function NotificationToast() {
  const { state, dispatch } = useApp()

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
    }
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {state.notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center space-x-3 p-4 rounded-lg border shadow-lg max-w-sm ${getBgColor(notification.type)}`}
        >
          {getIcon(notification.type)}
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">{notification.message}</p>
          <button
            onClick={() => dispatch({ type: "REMOVE_NOTIFICATION", payload: notification.id })}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
