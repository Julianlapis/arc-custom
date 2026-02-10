import { ImageResponse } from "next/og";

export const alt = "Arc – The full arc from idea to shipped code";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const ibmPlexMono = await fetch(
    "https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n5ig.ttf"
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    <div
      style={{
        background: "#f5f5f5",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
      }}
    >
      {/* Command heading */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          fontSize: "96px",
          fontFamily: "IBM Plex Mono",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        <span style={{ color: "#262626" }}>/arc</span>
        <span style={{ color: "#5A7B7B" }}>:</span>
        <span style={{ color: "#5A7B7B" }}>go</span>
      </div>

      {/* Bottom line */}
      <p
        style={{
          fontSize: "22px",
          fontFamily: "IBM Plex Mono",
          fontWeight: 400,
          color: "#737373",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}
      >
        The full arc from idea to shipped code. A Claude Code plugin.
      </p>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "IBM Plex Mono",
          data: ibmPlexMono,
          weight: 400,
          style: "normal" as const,
        },
      ],
    }
  );
}
