interface LogoProps {
  className?: string
  maxWidth?: string
}

export function Logo({ className, maxWidth = "200px" }: LogoProps) {
  return (
    <div style={{ maxWidth }} className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mrpa.png"
        alt="MRPA — Chamon Saúde"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  )
}
