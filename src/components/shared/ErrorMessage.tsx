interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
      <p className="text-lg font-medium">❌ {message}</p>
    </div>
  )
}
