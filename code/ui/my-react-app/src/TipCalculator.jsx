import { useState, useCallback } from 'react'

const PRESETS = [15, 18, 20, 22, 25]
const SPLIT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function TipCalculator() {
  const [bill, setBill] = useState('')
  const [tipPct, setTipPct] = useState(20)
  const [customTip, setCustomTip] = useState('')
  const [split, setSplit] = useState(1)
  const [rating, setRating] = useState(0)

  const activeTip = customTip !== '' ? parseFloat(customTip) || 0 : tipPct
  const billNum = parseFloat(bill) || 0
  const tipAmount = billNum * (activeTip / 100)
  const total = billNum + tipAmount
  const perPerson = split > 0 ? total / split : total

  const handleBill = useCallback((e) => {
    const v = e.target.value.replace(/[^0-9.]/g, '')
    setBill(v)
  }, [])

  const handlePreset = useCallback((pct) => {
    setTipPct(pct)
    setCustomTip('')
  }, [])

  const handleCustom = useCallback((e) => {
    const v = e.target.value.replace(/[^0-9.]/g, '')
    setCustomTip(v)
  }, [])

  const ratingLabels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Amazing']

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💰 Tip Calculator</h1>

        {/* Bill input */}
        <label style={styles.label}>Bill Amount</label>
        <div style={styles.inputWrap}>
          <span style={styles.dollar}>$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={bill}
            onChange={handleBill}
            style={styles.billInput}
          />
        </div>

        {/* Service rating */}
        <label style={styles.label}>How was the service?</label>
        <div style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => {
                setRating(star)
                // auto-suggest tip based on rating
                const suggested = [0, 10, 15, 18, 20, 25][star]
                handlePreset(suggested)
              }}
              style={{
                ...styles.starBtn,
                color: star <= rating ? '#fbbf24' : '#555',
                transform: star <= rating ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span style={styles.ratingLabel}>{ratingLabels[rating]}</span>
          )}
        </div>

        {/* Tip presets */}
        <label style={styles.label}>Tip Percentage</label>
        <div style={styles.presetRow}>
          {PRESETS.map((pct) => (
            <button
              key={pct}
              onClick={() => handlePreset(pct)}
              style={{
                ...styles.presetBtn,
                background: customTip === '' && tipPct === pct ? '#3b82f6' : '#2a2a3a',
                borderColor: customTip === '' && tipPct === pct ? '#3b82f6' : '#444',
              }}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Custom tip */}
        <div style={styles.customRow}>
          <span style={styles.customLabel}>Custom:</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="—"
            value={customTip}
            onChange={handleCustom}
            style={styles.customInput}
          />
          <span style={styles.pctSign}>%</span>
        </div>

        {/* Split */}
        <label style={styles.label}>Split Between</label>
        <div style={styles.splitRow}>
          {SPLIT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setSplit(n)}
              style={{
                ...styles.splitBtn,
                background: split === n ? '#8b5cf6' : '#2a2a3a',
                borderColor: split === n ? '#8b5cf6' : '#444',
              }}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Results */}
        <div style={styles.results}>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Tip</span>
            <span style={styles.resultValue}>{fmt(tipAmount)}</span>
          </div>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Total</span>
            <span style={styles.resultValue}>{fmt(total)}</span>
          </div>
          {split > 1 && (
            <div style={{ ...styles.resultRow, ...styles.perPerson }}>
              <span style={styles.resultLabel}>Per Person</span>
              <span style={{ ...styles.resultValue, color: '#8b5cf6' }}>
                {fmt(perPerson)}
              </span>
            </div>
          )}
        </div>

        {/* Quick summary */}
        {billNum > 0 && (
          <div style={styles.summary}>
            {fmt(billNum)} + {activeTip}% tip = <strong>{fmt(total)}</strong>
            {split > 1 && <> ({split} people × {fmt(perPerson)})</>}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#f0f4ff',
    padding: 16,
    boxSizing: 'border-box',
    overflow: 'auto',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'rgba(30, 30, 50, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: 20,
    padding: 28,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  title: {
    margin: '0 0 20px',
    fontSize: '1.6rem',
    fontWeight: 800,
    textAlign: 'center',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    opacity: 0.6,
    marginBottom: 6,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    background: '#1a1a2e',
    borderRadius: 12,
    padding: '0 14px',
    border: '1px solid #333',
  },
  dollar: {
    fontSize: 22,
    fontWeight: 700,
    opacity: 0.4,
    marginRight: 6,
  },
  billInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: 28,
    fontWeight: 700,
    padding: '12px 0',
    fontFamily: 'inherit',
  },
  starRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  starBtn: {
    background: 'none',
    border: 'none',
    fontSize: 28,
    cursor: 'pointer',
    transition: 'transform 0.15s, color 0.15s',
    padding: 2,
  },
  ratingLabel: {
    marginLeft: 8,
    fontSize: 13,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  presetRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetBtn: {
    flex: 1,
    minWidth: 50,
    padding: '10px 0',
    borderRadius: 10,
    border: '1.5px solid',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  customRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  customLabel: {
    fontSize: 14,
    opacity: 0.5,
  },
  customInput: {
    width: 70,
    background: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    padding: '8px 10px',
    outline: 'none',
    fontFamily: 'inherit',
    textAlign: 'center',
  },
  pctSign: {
    fontSize: 16,
    opacity: 0.4,
    fontWeight: 700,
  },
  splitRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  splitBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: '1.5px solid',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  results: {
    marginTop: 24,
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 15,
    opacity: 0.6,
  },
  resultValue: {
    fontSize: 22,
    fontWeight: 800,
  },
  perPerson: {
    paddingTop: 12,
    borderTop: '1px dashed rgba(255,255,255,0.1)',
  },
  summary: {
    marginTop: 16,
    padding: '10px 14px',
    background: 'rgba(59,130,246,0.1)',
    borderRadius: 10,
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 1.5,
  },
}
