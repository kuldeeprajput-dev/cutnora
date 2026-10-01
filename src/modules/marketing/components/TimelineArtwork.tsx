import { Eye, ImageIcon, Music, Type, Video } from "lucide-react";

const waveform = [
  18, 32, 44, 24, 56, 35, 66, 41, 22, 48, 62, 28, 38, 70, 44, 26, 56, 34, 18,
  45, 64, 36, 51, 24, 40, 58, 30, 46, 68, 35, 22, 52,
];

export function Waveform() {
  return (
    <div className="lp-waveform" aria-hidden="true">
      {[...waveform, ...waveform].map((height, index) => (
        <i key={index} style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

export function TimelineArtwork({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`lp-timeline ${compact ? "lp-timeline-compact" : ""}`}
      aria-hidden="true"
    >
      <div className="lp-timeline-ruler">
        <span>TRACKS</span>
        <div>
          {["00:00", "00:05", "00:10", "00:15", "00:20", "00:25"].map(
            (time) => (
              <span key={time}>{time}</span>
            ),
          )}
        </div>
      </div>
      <div className="lp-track">
        <div className="lp-track-label">
          <Eye />
          <Video />
          <span>Video 1</span>
        </div>
        <div className="lp-track-lane">
          <div className="lp-clip lp-clip-film" style={{ width: "43%" }}>
            <span>coast.mp4</span>
          </div>
          <div
            className="lp-clip lp-clip-film lp-clip-film-alt"
            style={{ width: "34%" }}
          >
            <span>shoreline.mp4</span>
          </div>
        </div>
      </div>
      {!compact && (
        <div className="lp-track">
          <div className="lp-track-label">
            <Eye />
            <ImageIcon />
            <span>Images</span>
          </div>
          <div className="lp-track-lane">
            <div
              className="lp-clip lp-image-clip"
              style={{ marginLeft: "20%", width: "27%" }}
            >
              <ImageIcon size={12} />
              coastal-still.webp
            </div>
          </div>
        </div>
      )}
      <div className="lp-track">
        <div className="lp-track-label">
          <Eye />
          <Type />
          <span>Text</span>
        </div>
        <div className="lp-track-lane">
          <div
            className="lp-clip lp-text-clip"
            style={{ marginLeft: "11%", width: "42%" }}
          >
            <Type size={12} />
            Find your own rhythm.
          </div>
        </div>
      </div>
      <div className="lp-track">
        <div className="lp-track-label">
          <Eye />
          <Music />
          <span>Audio</span>
        </div>
        <div className="lp-track-lane">
          <div className="lp-clip lp-audio-clip" style={{ width: "94%" }}>
            <Waveform />
          </div>
        </div>
      </div>
      <div className="lp-playhead" />
    </div>
  );
}
