import { useEffect, useRef, useState } from 'react'

const RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url='
const PODCAST_RSS = 'https://anchor.fm/s/ef92cad0/podcast/rss'

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PodcastPlayer() {
  const [episode, setEpisode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const res = await fetch(`${RSS_PROXY}${encodeURIComponent(PODCAST_RSS)}&count=1`)
        const json = await res.json()
        if (json.status === 'ok' && json.items?.length > 0) {
          const item = json.items[0]
          setEpisode({
            title: item.title,
            pubDate: new Date(item.pubDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
            description: item.description ? item.description.replace(/<[^>]+>/g, '').substring(0, 140) + '...' : null,
            audioUrl: item.enclosure?.link || item.link,
          })
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      }
      setLoading(false)
    }
    fetchEpisode()
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0)
  }

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0)
  }

  const handleEnded = () => setPlaying(false)

  const handleSeek = (e) => {
    const pct = e.target.value / 100
    if (audioRef.current) {
      audioRef.current.currentTime = pct * duration
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    )
  }

  if (error || !episode) {
    return (
      <div className="card">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎙️</span>
          <div>
            <p className="font-semibold text-gray-700 text-sm">Evangelio y Vida</p>
            <p className="text-xs text-gray-400">Mons. Héctor M. Pérez</p>
            <a
              href="https://open.spotify.com/show/evangelio-y-vida"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-600 hover:underline mt-1 block"
            >
              Escuchar en plataformas externas →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card border-amber-200 bg-gradient-to-br from-amber-50 to-white">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-amber-700 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🎙️</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Evangelio y Vida</p>
          <p className="font-semibold text-gray-800 text-sm leading-tight mt-0.5 line-clamp-2">{episode.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{episode.pubDate}</p>
        </div>
      </div>

      {episode.description && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{episode.description}</p>
      )}

      {episode.audioUrl && (
        <>
          <audio
            ref={audioRef}
            src={episode.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />

          {/* Barra de progreso */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
              style={{ background: `linear-gradient(to right, #b45309 ${progress}%, #e5e7eb ${progress}%)` }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <button
            onClick={togglePlay}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
          >
            <span className="text-lg">{playing ? '⏸' : '▶️'}</span>
            <span className="text-sm">{playing ? 'Pausar' : 'Reproducir episodio'}</span>
          </button>
        </>
      )}

      <p className="text-center text-xs text-gray-400 mt-2">Mons. Héctor M. Pérez</p>
    </div>
  )
}
